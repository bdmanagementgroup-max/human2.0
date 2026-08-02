import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/src/db";
import { userProgress } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ progress: [] });
    }

    const db = getDb();

    const progress = await db
      .select({
        contentId: userProgress.contentId,
        completed: userProgress.completed,
        completedAt: userProgress.completedAt,
      })
      .from(userProgress)
      .where(eq(userProgress.userId, userId));

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Progress fetch error:", error);
    return NextResponse.json({ progress: [] });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contentId } = await request.json();

    if (!contentId) {
      return NextResponse.json({ error: "Content ID required" }, { status: 400 });
    }

    const db = getDb();

    // Check if already completed
    const [existing] = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.contentId, contentId)))
      .limit(1);

    if (existing) {
      return NextResponse.json({ success: true, alreadyCompleted: true });
    }

    // Insert progress
    await db.insert(userProgress).values({
      userId,
      contentId,
      completed: true,
      completedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Progress save error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}