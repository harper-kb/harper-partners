import postgres from "postgres";

declare global {
  // eslint-disable-next-line no-var
  var __harperOpsSql: ReturnType<typeof postgres> | undefined;
}

function createClient() {
  const connectionString = process.env.HARPER_OPS_DATABASE_URL;
  if (!connectionString) {
    throw new Error("HARPER_OPS_DATABASE_URL is not set");
  }
  return postgres(connectionString, {
    prepare: false,
    idle_timeout: 20,
    max: 5,
  });
}

export function getSql() {
  if (!globalThis.__harperOpsSql) {
    globalThis.__harperOpsSql = createClient();
  }
  return globalThis.__harperOpsSql;
}
