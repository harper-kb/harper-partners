import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getHarperTrackingBoard } from "@/lib/harper-tracking/data";

function isHarperEmail(email: string | undefined | null) {
  if (!email) return false;
  return email.trim().toLowerCase().endsWith("@harperinsure.com");
}

/** Internal Harper board — signed agencies + referrals. Harper emails only. */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });
  }

  const user = await currentUser();
  const email =
    user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress || user?.emailAddresses[0]?.emailAddress;

  if (!isHarperEmail(email)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Harper Tracking is internal-only. Sign in with a @harperinsure.com account.",
      },
      { status: 403 },
    );
  }

  try {
    const agencies = await getHarperTrackingBoard();
    return NextResponse.json({
      ok: true,
      email,
      agencies,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("harper-tracking load failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not load tracking board." },
      { status: 500 },
    );
  }
}
