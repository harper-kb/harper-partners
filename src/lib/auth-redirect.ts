/** Post-Clerk destinations we allow from ?redirect_url= (open redirects blocked). */
const ALLOWED_REDIRECTS = new Set([
  "/track",
  "/track/refer",
  "/blitz-track",
  "/blitz-refer",
  "/harper-tracking",
]);

/**
 * Normalize a redirect_url query value to a safe same-origin path.
 * Defaults to Partner Track when missing or invalid.
 */
export function safeAuthRedirect(
  raw: string | string[] | undefined | null,
  fallback = "/track",
): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || typeof value !== "string") return fallback;

  let path = value.trim();
  try {
    if (/^https?:\/\//i.test(path)) {
      path = new URL(path).pathname;
    }
  } catch {
    return fallback;
  }

  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  const bare = path.split("?")[0]?.split("#")[0] ?? "";
  return ALLOWED_REDIRECTS.has(bare) ? bare : fallback;
}
