import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import {
  findAgencyByEmail,
  getAgencyById,
  normalizeEmail,
  type PartnerAgency,
} from "@/lib/track/data";

export const TRACK_COOKIE = "harper_partner_track";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

type SessionPayload = {
  agencyId: string;
  email: string;
  exp: number;
};

function secret() {
  return (
    process.env.TRACK_SESSION_SECRET ||
    process.env.HARPER_OPS_DATABASE_URL ||
    "harper-partners-track-preview-dev-secret"
  );
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function encodeSession(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  return `${body}.${sign(body)}`;
}

function decodeSession(token: string): SessionPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (!payload.agencyId || !payload.email || !payload.exp) return null;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}

export function createSessionToken(email: string, agency: PartnerAgency) {
  return encodeSession({
    agencyId: agency.id,
    email: normalizeEmail(email),
    exp: Date.now() + COOKIE_MAX_AGE * 1000,
  });
}

export function resolveAgencyForEmail(email: string) {
  return findAgencyByEmail(email);
}

export async function getTrackSession(): Promise<{
  email: string;
  agency: PartnerAgency;
} | null> {
  const jar = await cookies();
  const token = jar.get(TRACK_COOKIE)?.value;
  if (!token) return null;
  const payload = decodeSession(token);
  if (!payload) return null;
  const agency = getAgencyById(payload.agencyId);
  if (!agency) return null;
  return { email: payload.email, agency };
}
