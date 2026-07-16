// One-time helper: run the Google OAuth consent flow and print (and save) a
// refresh token so harper-partners can send the confirmation email through the
// Gmail API as partnerships@harperinsure.com.
//
// HOW TO RUN:
//   1. Make sure .env.local has GOOGLE_OAUTH_CLIENT_ID and
//      GOOGLE_OAUTH_CLIENT_SECRET filled in.
//   2. From the project root run:  node scripts/get-gmail-token.mjs
//   3. A Google sign-in link is printed. Open it, sign in as
//      partnerships@harperinsure.com, and click "Allow".
//   4. The refresh token is printed and appended to .env.local automatically.
//
// The OAuth client must have this exact redirect URI registered:
//   http://localhost:3000/oauth2callback
// (override with OAUTH_REDIRECT_URI if your client uses a different one).

import http from "node:http";
import { readFileSync, appendFileSync, existsSync } from "node:fs";
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
const TARGET_EMAIL =
  process.env.USER_GOOGLE_EMAIL || "partnerships@harperinsure.com";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "\n[!] Missing GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET.\n" +
      "    Add them to .env.local, then run this script again.\n"
  );
  process.exit(1);
}

// gmail.send is all we need to send the confirmation email.
const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

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
  prompt: "consent", // force a refresh_token even on repeat authorizations
  scope: SCOPES,
  login_hint: TARGET_EMAIL,
});

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
    console.error(`\n[!] Authorization failed: ${error}\n`);
    server.close();
    process.exit(1);
  }

  if (!code) {
    res.writeHead(400);
    res.end("Missing authorization code");
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    const refreshToken = tokens.refresh_token;

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(
      "<h2>All set. You can close this tab and return to the terminal.</h2>"
    );

    if (!refreshToken) {
      console.error(
        "\n[!] No refresh token was returned. Revoke the app's access at\n" +
          "    https://myaccount.google.com/permissions and run this again.\n"
      );
      server.close();
      process.exit(1);
    }

    console.log("\n==================================================");
    console.log("SUCCESS — your refresh token is:\n");
    console.log(refreshToken);
    console.log("\n==================================================");

    // Auto-append to .env.local if not already present.
    const existing = existsSync(ENV_PATH)
      ? readFileSync(ENV_PATH, "utf-8")
      : "";
    if (existing.includes("GOOGLE_REFRESH_TOKEN=") &&
        !/^\s*#\s*GOOGLE_REFRESH_TOKEN=/m.test(existing)) {
      console.log(
        "\n[i] .env.local already has a GOOGLE_REFRESH_TOKEN line.\n" +
          "    Replace it with the value above if you want to use this token.\n"
      );
    } else {
      appendFileSync(
        ENV_PATH,
        `\nGOOGLE_REFRESH_TOKEN=${refreshToken}\n`
      );
      console.log("\n[i] Appended GOOGLE_REFRESH_TOKEN to .env.local.\n");
    }

    server.close();
    process.exit(0);
  } catch (e) {
    res.writeHead(500);
    res.end("Token exchange failed");
    console.error("\n[!] Token exchange failed:", e?.message || e, "\n");
    server.close();
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log("\nHarper Partners — Gmail token helper");
  console.log("------------------------------------");
  console.log(`Sign in as: ${TARGET_EMAIL}`);
  console.log(`Listening for the redirect on: ${REDIRECT_URI}\n`);
  console.log("1) Open this URL in your browser:\n");
  console.log(authUrl);
  console.log(
    "\n2) Choose/sign in as " +
      TARGET_EMAIL +
      ' and click "Allow".\n' +
      "3) You'll be redirected back here and the token will be saved.\n"
  );
});
