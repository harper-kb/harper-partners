// Transactional email for harper-partners, sent through the Gmail API as
// partnerships@harperinsure.com. Authorization is a Google OAuth2 refresh token
// (see scripts/get-gmail-token.mjs for the one-time login that mints it).
//
// Everything here is best-effort. Sending a confirmation must NEVER block or
// fail partner lead capture — callers should treat a failed send as a no-op and
// still report success for the saved lead.

import { google } from "googleapis";

const GOOGLE_OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
const GOOGLE_OAUTH_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || "";
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN || "";

// The Gmail mailbox we authenticate as and send from.
const USER_GOOGLE_EMAIL =
  process.env.USER_GOOGLE_EMAIL || "partnerships@harperinsure.com";

// The visible From header. Uses the authenticated mailbox with a friendly name.
const FROM = `Harper Partners <${USER_GOOGLE_EMAIL}>`;

// Replies always route to the real partnerships inbox.
const REPLY_TO =
  process.env.PARTNER_CONFIRMATION_REPLY_TO || "partnerships@harperinsure.com";

export function isEmailConfigured(): boolean {
  return Boolean(
    GOOGLE_OAUTH_CLIENT_ID &&
      GOOGLE_OAUTH_CLIENT_SECRET &&
      GOOGLE_REFRESH_TOKEN
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** First name (best-effort) for a warmer greeting; falls back gracefully. */
function firstName(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0] ?? "";
  return first || "there";
}

export function buildPartnerConfirmationEmail(name: string): {
  subject: string;
  text: string;
  html: string;
} {
  const greetingName = firstName(name);
  const safeName = escapeHtml(greetingName);

  const subject = "Thanks for your interest in Harper Partners";

  const text = [
    `Hi ${greetingName},`,
    "",
    "Thanks for your interest in the Harper Partners program — we're glad you reached out.",
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

  // Absolute URL is required for email images. This logo PNG is served from
  // harper-partners/public/email/ and only resolves once the site is deployed.
  const logoUrl = "https://partners.harperinsure.com/email/harper-logo.png";

  // Coral-accented bullet: a two-column table row so the coral bar renders
  // reliably across Gmail/Outlook/Apple Mail (no CSS ::before, no flex/grid).
  const bullet = (body: string): string => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px;">
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
                <p style="margin:0 0 16px;">Thanks for your interest in the Harper Partners program — we&#39;re glad you reached out.</p>
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

/** RFC 2047 "encoded-word" for header values that may contain non-ASCII. */
function encodeHeader(value: string): string {
  // Fast path: plain ASCII headers can be sent as-is.
  if (/^[\x20-\x7E]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf-8").toString("base64")}?=`;
}

/** Wrap base64 content to 76-char lines (RFC 2045 line-length limit). */
function wrapBase64(input: string): string {
  return (input.match(/.{1,76}/g) ?? [input]).join("\r\n");
}

/** Base64url without padding, as required by the Gmail API `raw` field. */
function toBase64Url(input: string): string {
  return Buffer.from(input, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Assemble an RFC 822 multipart/alternative message (plain text + HTML) that
 * renders in every mail client. Bodies are base64-encoded with a UTF-8 charset
 * so accented names and special characters survive intact.
 */
function buildMimeMessage(params: {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
}): string {
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
 * Build an authenticated Gmail client from the OAuth2 credentials. Throws a
 * clear error if any required environment variable is missing so failures are
 * easy to diagnose in server logs.
 */
function getGmailClient() {
  const missing: string[] = [];
  if (!GOOGLE_OAUTH_CLIENT_ID) missing.push("GOOGLE_OAUTH_CLIENT_ID");
  if (!GOOGLE_OAUTH_CLIENT_SECRET) missing.push("GOOGLE_OAUTH_CLIENT_SECRET");
  if (!GOOGLE_REFRESH_TOKEN) missing.push("GOOGLE_REFRESH_TOKEN");
  if (missing.length > 0) {
    throw new Error(
      `Gmail sending is not configured — missing env var(s): ${missing.join(
        ", "
      )}. Run scripts/get-gmail-token.mjs to obtain a refresh token.`
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

  return google.gmail({ version: "v1", auth: oauth2Client });
}

/**
 * Send the partner confirmation email via the Gmail API. Best-effort: returns a
 * result object and never throws. If the Gmail credentials are not configured,
 * this is a no-op and the caller should simply skip sending (the lead is already
 * saved).
 */
export async function sendPartnerConfirmation(params: {
  toEmail: string;
  name: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string; id?: string }> {
  if (!isEmailConfigured()) {
    return {
      ok: false,
      skipped: true,
      error: "Gmail credentials are not set",
    };
  }

  const { subject, text, html } = buildPartnerConfirmationEmail(params.name);

  try {
    const gmail = getGmailClient();

    const raw = toBase64Url(
      buildMimeMessage({
        from: FROM,
        to: params.toEmail,
        replyTo: REPLY_TO,
        subject,
        text,
        html,
      })
    );

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    return { ok: true, id: res.data.id ?? undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
