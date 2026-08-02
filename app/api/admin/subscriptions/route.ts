import { requireAdmin } from "@/src/lib/auth";
import { getDb } from "@/src/db";
import { subscriptions, users } from "@/src/db/schema";
import { eq, desc, count, and, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const db = getDb();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    const offset = (page - 1) * limit;

    const conditions = [];
    if (status) {
      conditions.push(eq(subscriptions.status, status as any));
    }
    if (search) {
      conditions.push(
        sql`${users.email} ILIKE ${`%${search}%`} OR ${users.clerkId} ILIKE ${`%${search}%`} OR ${subscriptions.paypalSubscriptionId} ILIKE ${`%${search}%`}`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const subsWithUsers = await db
      .select({
        id: subscriptions.id,
        userId: subscriptions.userId,
        paypalPayerId: subscriptions.paypalPayerId,
        paypalSubscriptionId: subscriptions.paypalSubscriptionId,
        paypalPlanId: subscriptions.paypalPlanId,
        status: subscriptions.status,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
        canceledAt: subscriptions.canceledAt,
        trialStart: subscriptions.trialStart,
        trialEnd: subscriptions.trialEnd,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
        userEmail: users.email,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userClerkId: users.clerkId,
      })
      .from(subscriptions)
      .leftJoin(users, eq(subscriptions.userId, users.id))
      .where(whereClause)
      .orderBy(desc(subscriptions.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count: total }] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(whereClause);

    return NextResponse.json({
      subscriptions: subsWithUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin subscriptions fetch error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.startsWith("Unauthorized") ? 401 : message.startsWith("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}