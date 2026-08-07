import { getSql } from "@/lib/db";
import { isEmailConfigured, sendAutoIntakeNotification } from "@/lib/email";

function str(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * Persists an auto auction dealer intake. Answers arrive as a flat map from
 * the booth questionnaire; we lift the fields needed for follow-up into
 * columns and keep the full record (answers + booth auto-fills) as JSONB.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const payload = (body ?? {}) as Record<string, unknown>;
  const status = payload.status === "disqualified" ? "disqualified" : "qualified";
  const answers =
    payload.answers && typeof payload.answers === "object"
      ? (payload.answers as Record<string, unknown>)
      : {};
  const autofill =
    payload.autofill && typeof payload.autofill === "object"
      ? (payload.autofill as Record<string, unknown>)
      : {};

  const businessName = str(answers.businessName, 200);
  const contactName = str(answers.contactName, 120);
  const phone = str(answers.phone, 40);

  if (!businessName)
    return Response.json({ error: "Business name is required." }, { status: 400 });
  if (!contactName)
    return Response.json({ error: "Contact name is required." }, { status: 400 });
  if (!phone)
    return Response.json({ error: "Phone is required." }, { status: 400 });

  const userAgent = request.headers.get("user-agent")?.slice(0, 500) ?? null;

  try {
    const sql = getSql();
    await sql`
      INSERT INTO partnerships.auto_auction_intakes
        (status, business_name, contact_name, phone, answers, autofill, source, user_agent)
      VALUES
        (${status}, ${businessName}, ${contactName}, ${phone},
         ${sql.json(JSON.parse(JSON.stringify(answers)))},
         ${sql.json(JSON.parse(JSON.stringify(autofill)))},
         ${"auto-auction-booth-form"}, ${userAgent})
    `;
  } catch (err) {
    console.error("auto intake insert failed:", err);
    return Response.json(
      { error: "Something went wrong saving your details." },
      { status: 500 }
    );
  }

  // Best-effort notification to the partnerships inbox. The intake is already
  // saved, so a failed send must not change the response.
  if (isEmailConfigured()) {
    try {
      const result = await sendAutoIntakeNotification({
        status,
        answers: Object.fromEntries(
          Object.entries(answers).map(([k, v]) => [k, str(v, 500)])
        ),
        autofill: Object.fromEntries(
          Object.entries(autofill).map(([k, v]) => [k, str(v, 500)])
        ),
      });
      if (!result.ok) {
        console.error("auto intake notification email failed:", result.error);
      }
    } catch (err) {
      console.error("auto intake notification email threw:", err);
    }
  } else {
    console.warn(
      "Gmail credentials not set — auto intake saved, notification email skipped."
    );
  }

  return Response.json({ ok: true }, { status: 200 });
}
