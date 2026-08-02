import { auth } from "@clerk/nextjs/server";
import { getUserWithSubscription } from "@/src/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ hasActiveSubscription: false });
    }

    const userWithSub = await getUserWithSubscription();
    const status = userWithSub?.subscription?.status;
    const hasActiveSubscription = status === "active" || status === "trialing";

    return NextResponse.json({ hasActiveSubscription });
  } catch (error) {
    console.error("Subscription check error:", error);
    return NextResponse.json({ hasActiveSubscription: false });
  }
}