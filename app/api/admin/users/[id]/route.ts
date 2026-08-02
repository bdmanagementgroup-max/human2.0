import { requireAdmin } from "@/src/lib/auth";
import { getDb } from "@/src/db";
import { users, subscriptions, userProgress } from "@/src/db/schema";
import { eq, count, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const db = getDb();

    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, id))
      .limit(1);

    const progress = await db
      .select({
        contentId: userProgress.contentId,
        completed: userProgress.completed,
        completedAt: userProgress.completedAt,
        progressPercent: userProgress.progressPercent,
      })
      .from(userProgress)
      .where(eq(userProgress.userId, id));

    return NextResponse.json({ user, subscription, progress });
  } catch (error) {
    console.error("Admin user fetch error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.startsWith("Unauthorized") ? 401 : message.startsWith("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const db = getDb();

    const body = await request.json();
    const { role, firstName, lastName } = body;

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (role) updateData.role = role;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin user update error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.startsWith("Unauthorized") ? 401 : message.startsWith("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const db = getDb();

    // Don't allow deleting yourself
    const { userId } = await import("@clerk/nextjs/server").then((m) => m.auth());
    const [currentUser] = await db.select().from(users).where(eq(users.clerkId, userId!)).limit(1);
    if (currentUser?.id === id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    await db.delete(users).where(eq(users.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin user delete error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.startsWith("Unauthorized") ? 401 : message.startsWith("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}