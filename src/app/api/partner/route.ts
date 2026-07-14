import { getSql } from "@/lib/db";

const LINES_OPTIONS = [
  "Personal & auto only",
  "Personal, auto & some commercial",
  "Full commercial book",
  "Other / not sure",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function str(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const payload = (body ?? {}) as Record<string, unknown>;
  const name = str(payload.name, 120);
  const agency = str(payload.agency, 160);
  const email = str(payload.email, 200);
  const state = str(payload.state, 40);
  const lines = str(payload.lines, 80);
  const licensed = payload.licensed === true;

  if (!name) return Response.json({ error: "Name is required." }, { status: 400 });
  if (!agency) return Response.json({ error: "Agency is required." }, { status: 400 });
  if (!email || !EMAIL_RE.test(email))
    return Response.json({ error: "A valid email is required." }, { status: 400 });
  if (!state) return Response.json({ error: "State is required." }, { status: 400 });
  if (!LINES_OPTIONS.includes(lines))
    return Response.json({ error: "Select the lines you write." }, { status: 400 });
  if (!licensed)
    return Response.json(
      { error: "You must confirm you are a licensed agent." },
      { status: 400 }
    );

  const userAgent = request.headers.get("user-agent")?.slice(0, 500) ?? null;

  try {
    const sql = getSql();
    await sql`
      INSERT INTO partnerships.partner_signups
        (name, agency, email, state, lines, licensed, source, user_agent)
      VALUES
        (${name}, ${agency}, ${email}, ${state}, ${lines}, ${licensed}, ${"harper-partners-landing"}, ${userAgent})
    `;
  } catch (err) {
    console.error("partner signup insert failed:", err);
    return Response.json(
      { error: "Something went wrong saving your details." },
      { status: 500 }
    );
  }

  return Response.json({ ok: true }, { status: 200 });
}
