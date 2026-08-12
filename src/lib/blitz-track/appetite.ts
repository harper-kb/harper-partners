/** Blitz lead routing: inside vs outside their underwriting appetite. */
export type BlitzAppetite = "inside" | "outside";

export const BLITZ_APPETITE_OPTIONS: {
  value: BlitzAppetite | "";
  label: string;
  hint: string;
}[] = [
  { value: "", label: "Select…", hint: "" },
  {
    value: "outside",
    label: "Outside Blitz appetite",
    hint: "Harper places / binds — still send these here",
  },
  {
    value: "inside",
    label: "Inside Blitz appetite",
    hint: "Fits Blitz — Harper can help quote; lead can go back to Blitz",
  },
];

const APPETITE_TAG_RE = /^\[Blitz appetite:\s*(inside|outside)\]\s*/i;

export function appetiteLabel(value: BlitzAppetite | "" | null | undefined) {
  if (value === "inside") return "Inside Blitz appetite";
  if (value === "outside") return "Outside Blitz appetite";
  return null;
}

/** Prefix notes so we can store appetite without a new DB column. */
export function withAppetiteNotes(
  notes: string | null | undefined,
  appetite: BlitzAppetite | "" | null | undefined,
): string | null {
  const cleaned = (notes || "").replace(APPETITE_TAG_RE, "").trim();
  if (!appetite) return cleaned || null;
  const tag = `[Blitz appetite: ${appetite}]`;
  return cleaned ? `${tag}\n${cleaned}` : tag;
}

export function parseAppetiteFromNotes(
  notes: string | null | undefined,
): BlitzAppetite | null {
  if (!notes) return null;
  const m = notes.match(APPETITE_TAG_RE);
  if (!m) return null;
  const v = m[1]?.toLowerCase();
  return v === "inside" || v === "outside" ? v : null;
}

export function stripAppetiteTag(notes: string | null | undefined) {
  if (!notes) return null;
  const cleaned = notes.replace(APPETITE_TAG_RE, "").trim();
  return cleaned || null;
}
