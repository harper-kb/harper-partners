// One-off, idempotent setup for the /auto booth form. Creates the
// partnerships.auto_auction_intakes table used by /api/auto-intake.
//
// Usage: node --env-file=.env.local scripts/create-auto-intake-table.mjs
import postgres from "postgres";

const url = process.env.HARPER_OPS_DATABASE_URL;
if (!url) {
  console.error("HARPER_OPS_DATABASE_URL is not set.");
  process.exit(1);
}

const sql = postgres(url, { prepare: false, max: 1 });

try {
  await sql`
    CREATE TABLE IF NOT EXISTS partnerships.auto_auction_intakes (
      id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      created_at    timestamptz NOT NULL DEFAULT now(),
      status        text NOT NULL,
      business_name text NOT NULL,
      contact_name  text NOT NULL,
      phone         text NOT NULL,
      answers       jsonb NOT NULL DEFAULT '{}'::jsonb,
      autofill      jsonb NOT NULL DEFAULT '{}'::jsonb,
      source        text,
      user_agent    text
    )
  `;
  console.log("partnerships.auto_auction_intakes is ready.");
} finally {
  await sql.end();
}
