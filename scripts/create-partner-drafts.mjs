// One-time helper: create TWO branded Harper Partners confirmation emails as
// DRAFTS (unsent) in the partnerships@harperinsure.com mailbox, so they can be
// reviewed in Gmail and sent by hand.
//
// Why a separate script: the app's saved token is send-only (gmail.send), which
// cannot create drafts. This runs a one-time OAuth consent with the gmail.compose
// scope. The resulting token is used IN MEMORY ONLY and is never written to disk.
//
// HOW TO RUN:
//   1. Make sure .env.local has GOOGLE_OAUTH_CLIENT_ID and
//      GOOGLE_OAUTH_CLIENT_SECRET filled in.
//   2. From the project root run:  node scripts/create-partner-drafts.mjs
//   3. A Google sign-in link is printed. Open it, sign in as
//      partnerships@harperinsure.com, and click "Allow".
//   4. Two drafts are created in the partnerships@ Drafts folder. Nothing is sent.
//
// The OAuth client must have this exact redirect URI registered:
//   http://localhost:3000/oauth2callback
// (override with OAUTH_REDIRECT_URI if your client uses a different one).

import http from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { google } from "googleapis";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.join(__dirname, "..", ".env.local");

// Minimal .env.local loader (avoids adding a dotenv dependency).
function loadEnvLocal() {
  if (!existsSync(ENV_PATH)) return;
  for (const line of readFileSync(ENV_PATH, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnvLocal();

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const REDIRECT_URI =
  process.env.OAUTH_REDIRECT_URI || "http://localhost:3000/oauth2callback";
const TARGET_EMAIL = "partnerships@harperinsure.com";
const FROM = `Harper Partners <${TARGET_EMAIL}>`;
const REPLY_TO = TARGET_EMAIL;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "\n[!] Missing GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET.\n" +
      "    Add them to .env.local, then run this script again.\n"
  );
  process.exit(1);
}

// gmail.compose is required to create drafts (gmail.send cannot).
const SCOPES = ["https://www.googleapis.com/auth/gmail.compose"];

// --- Email content --------------------------------------------------------
// Branded template reproduced from src/lib/email.ts (buildPartnerConfirmationEmail).
// Only the greeting and the second paragraph (the warm intro line) are
// personalized per recipient; everything else is identical to the template.

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** RFC 2047 "encoded-word" for header values that may contain non-ASCII. */
function encodeHeader(value) {
  if (/^[\x20-\x7E]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf-8").toString("base64")}?=`;
}

/** Wrap base64 content to 76-char lines (RFC 2045 line-length limit). */
function wrapBase64(input) {
  return (input.match(/.{1,76}/g) ?? [input]).join("\r\n");
}

/** Base64url without padding, as required by the Gmail API `raw` field. */
function toBase64Url(input) {
  return Buffer.from(input, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Assemble an RFC 822 multipart/alternative message (plain text + HTML). */
function buildMimeMessage(params) {
  const boundary = `harper_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2)}`;

  const encodedText = wrapBase64(
    Buffer.from(params.text, "utf-8").toString("base64")
  );
  const encodedHtml = wrapBase64(
    Buffer.from(params.html, "utf-8").toString("base64")
  );

  return [
    `From: ${params.from}`,
    `To: ${params.to}`,
    `Reply-To: ${params.replyTo}`,
    `Subject: ${encodeHeader(params.subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    encodedText,
    "",
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    encodedHtml,
    "",
    `--${boundary}--`,
    "",
  ].join("\r\n");
}

/**
 * Build a personalized confirmation email. `greetingName` is the first name used
 * after "Hi", and `introText`/`introHtml` replace the template's second
 * paragraph (the warm intro). Everything else matches src/lib/email.ts exactly.
 */
function buildEmail({ greetingName, introText }) {
  const safeName = escapeHtml(greetingName);
  const introHtml = escapeHtml(introText);

  const subject = "Thanks for your interest in Harper Partners";

  const text = [
    `Hi ${greetingName},`,
    "",
    introText,
    "",
    "Here's what happens next: someone from Harper's partnerships team will reach out to confirm your license and walk you through the 50/50 commission-share, so you know exactly how it works before you send us anything.",
    "",
    "A quick reminder of how the partnership works:",
    "- It's open to licensed insurance agents only — you must be licensed in the state where the business is written.",
    "- You forward the commercial clients you can't place. Harper quotes, binds, and services those accounts end to end.",
    "- Referred accounts are owned and serviced by Harper. You earn 50% of the commission on business we bind from your referral, paid after the account settles.",
    "",
    "If you have any questions in the meantime, just reply to this email and it'll reach our partnerships team at partnerships@harperinsure.com.",
    "",
    "Talk soon,",
    "The Harper Partners team",
    "",
    "Harper Global Enterprises Inc. DBA Harper Global Insurance Agency",
    "425 Market St, Suite 1300, San Francisco, CA 94105",
    "This is a confirmation of your interest in the Harper Partners program, not an offer of insurance.",
  ].join("\n");

  const logoUrl = "https://partners.harperinsure.com/email/harper-logo.png";

  const bullet = (body) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px;">
                  <tr>
                    <td width="3" valign="top" style="width:3px;background-color:#ff6d63;border-radius:2px;font-size:0;line-height:0;">&nbsp;</td>
                    <td width="16" style="width:16px;font-size:0;line-height:0;">&nbsp;</td>
                    <td valign="top" style="color:#33474e;font-size:15px;line-height:1.6;">${body}</td>
                  </tr>
                </table>`;

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#faf6f1;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:#faf6f1;">Thanks for your interest in the Harper Partners program — here's what happens next.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf6f1;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background-color:#ffffff;border:1px solid #ece3d7;border-radius:12px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
            <!-- Header band -->
            <tr>
              <td align="center" style="background-color:#1d3a47;padding:36px 32px 32px;">
                <img src="${logoUrl}" alt="Harper" width="200" height="51" style="display:block;border:0;outline:none;text-decoration:none;width:200px;height:auto;max-width:200px;" />
                <div style="margin-top:16px;color:#f6e1ce;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Partner Program</div>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="padding:36px 40px 8px;color:#33474e;font-size:15px;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                <p style="margin:0 0 18px;font-size:17px;color:#1d3a47;font-weight:600;">Hi ${safeName},</p>
                <p style="margin:0 0 16px;">${introHtml}</p>
                <p style="margin:0 0 22px;">Here&#39;s what happens next: someone from Harper&#39;s partnerships team will reach out to confirm your license and walk you through the 50/50 commission-share, so you know exactly how it works before you send us anything.</p>
                <!-- Coral bridge rule -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
                  <tr>
                    <td width="56" style="width:56px;border-top:2px solid #ff6d63;font-size:0;line-height:0;">&nbsp;</td>
                    <td style="border-top:1px solid #ece3d7;font-size:0;line-height:0;">&nbsp;</td>
                  </tr>
                </table>
                <p style="margin:0 0 16px;font-weight:600;color:#1d3a47;font-size:13px;letter-spacing:0.02em;text-transform:uppercase;">A quick reminder of how the partnership works</p>
                ${bullet("It&#39;s open to licensed insurance agents only — you must be licensed in the state where the business is written.")}
                ${bullet("You forward the commercial clients you can&#39;t place. Harper quotes, binds, and services those accounts end to end.")}
                ${bullet("Referred accounts are owned and serviced by Harper. You earn 50% of the commission on business we bind from your referral, paid after the account settles.")}
                <p style="margin:22px 0 16px;">If you have any questions in the meantime, just reply to this email and it&#39;ll reach our partnerships team at <a href="mailto:partnerships@harperinsure.com" style="color:#e85a52;font-weight:600;text-decoration:none;">partnerships@harperinsure.com</a>.</p>
                <p style="margin:0 0 4px;">Talk soon,</p>
                <p style="margin:0 0 32px;font-weight:600;color:#1d3a47;">The Harper Partners team</p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding:22px 40px 26px;background-color:#f3ebe3;border-top:1px solid #ece3d7;color:#6b7f86;font-size:12px;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                <p style="margin:0 0 4px;font-weight:600;color:#5a7179;">Harper Global Enterprises Inc. DBA Harper Global Insurance Agency</p>
                <p style="margin:0 0 10px;">425 Market St, Suite 1300, San Francisco, CA 94105</p>
                <p style="margin:0;">This is a confirmation of your interest in the Harper Partners program, not an offer of insurance.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}

// The two recipients, each with a personalized second paragraph.
const RECIPIENTS = [
  {
    to: "casey@casepod.show",
    greetingName: "Casey",
    introText:
      "It was great connecting with you at Agency X — thanks for your interest in the Harper Partners program. Since you're licensed in Texas, you're already set up well to start referring the commercial clients you can't place.",
  },
  {
    to: "jessica@eclipseinsure.com",
    greetingName: "Jessica",
    introText:
      "It was great connecting with you and the team at Eclipse Insurance — thanks for your interest in the Harper Partners program. Since you're already licensed in Illinois and Missouri, you're in a great spot to refer commercial business across both states.",
  },
];

// --- OAuth + draft creation ----------------------------------------------

const redirectUrl = new URL(REDIRECT_URI);
const PORT = Number(redirectUrl.port) || 80;
const CALLBACK_PATH = redirectUrl.pathname;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: SCOPES,
  login_hint: TARGET_EMAIL,
});

async function createDrafts(gmail) {
  const created = [];
  for (const r of RECIPIENTS) {
    const { subject, text, html } = buildEmail({
      greetingName: r.greetingName,
      introText: r.introText,
    });
    const raw = toBase64Url(
      buildMimeMessage({
        from: FROM,
        to: r.to,
        replyTo: REPLY_TO,
        subject,
        text,
        html,
      })
    );
    const res = await gmail.users.drafts.create({
      userId: "me",
      requestBody: { message: { raw } },
    });
    created.push({ to: r.to, draftId: res.data.id });
  }
  return created;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname !== CALLBACK_PATH) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    res.writeHead(400, { "Content-Type": "text/html" });
    res.end(`<h2>Authorization failed: ${error}</h2>`);
    console.error(
      `\n[!] Authorization was not granted (${error}).\n` +
        "    Make sure you signed in as partnerships@harperinsure.com and\n" +
        '    clicked "Allow". Then run the script again.\n'
    );
    server.close();
    process.exit(1);
  }

  if (!code) {
    res.writeHead(400);
    res.end("Missing authorization code");
    return;
  }

  try {
    // Token is kept in memory only — never written to .env.local or any file.
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const created = await createDrafts(gmail);

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(
      "<h2>Drafts created. You can close this tab and return to the terminal.</h2>"
    );

    console.log("\n==================================================");
    console.log("SUCCESS — 2 drafts created in partnerships@ Drafts:\n");
    for (const c of created) {
      console.log(`  • ${c.to}  (draft id: ${c.draftId})`);
    }
    console.log(
      "\nNothing was sent. Open Gmail → Drafts as partnerships@harperinsure.com,"
    );
    console.log("review each one, and click Send when you're ready.");
    console.log("==================================================\n");

    server.close();
    process.exit(0);
  } catch (e) {
    res.writeHead(500);
    res.end("Draft creation failed");
    const msg = e?.message || String(e);
    console.error("\n[!] Could not create the drafts.\n    Reason:", msg, "\n");
    if (/redirect_uri_mismatch/i.test(msg)) {
      console.error(
        "    This means the OAuth client doesn't have this redirect URI registered:\n" +
          `      ${REDIRECT_URI}\n` +
          "    Add it in Google Cloud Console → Credentials, or set OAUTH_REDIRECT_URI\n" +
          "    to a URI the client already allows, then run again.\n"
      );
    } else if (/access_denied|insufficient|scope/i.test(msg)) {
      console.error(
        "    This looks like a permissions/scope issue. Re-run and be sure to\n" +
          '    sign in as partnerships@harperinsure.com and click "Allow".\n'
      );
    }
    server.close();
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log("\nHarper Partners — create review drafts");
  console.log("--------------------------------------");
  console.log(`Sign in as: ${TARGET_EMAIL}`);
  console.log(`Listening for the redirect on: ${REDIRECT_URI}\n`);
  console.log("1) Open this URL in your browser:\n");
  console.log(authUrl);
  console.log(
    "\n2) Choose/sign in as " +
      TARGET_EMAIL +
      ' and click "Allow".\n' +
      "3) Two branded drafts will be created (unsent). Nothing is sent.\n"
  );
});
