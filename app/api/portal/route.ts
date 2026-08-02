import { cancelSubscription } from "@/src/actions/subscription";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const result = await cancelSubscription();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cancel failed" },
      { status: 500 }
    );
  }
}