import { requireAdmin } from "@/src/lib/auth";
import { getDb } from "@/src/db";
import { users, subscriptions } from "@/src/db/schema";
import { eq, desc, count, sql, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const db = getDb();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const subscriptionStatus = searchParams.get("subscriptionStatus") || "";

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    if (search) {
      conditions.push(
        sql`(${users.email} ILIKE ${`%${search}%`} OR ${users.firstName} ILIKE ${`%${search}%`} OR ${users.lastName} ILIKE ${`%${search}%`} OR ${users.clerkId} ILIKE ${`%${search}%`})`
      );
    }
    if (role) {
      conditions.push(eq(users.role, role as "member" | "admin" | "super_admin"));
    }

    let whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch users with subscription info
    const usersWithSubs = await db
      .select({
        id: users.id,
        clerkId: users.clerkId,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        imageUrl: users.imageUrl,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        subscriptionStatus: subscriptions.status,
        subscriptionId: subscriptions.id,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
      })
      .from(users)
      .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ count: total }] = await db
      .select({ count: count() })
      .from(users)
      .where(whereClause);

    // Filter by subscription status if requested
    let filteredUsers = usersWithSubs;
    if (subscriptionStatus) {
      filteredUsers = usersWithSubs.filter(
        (u) => (u.subscriptionStatus || "none") === subscriptionStatus
      );
    }

    return NextResponse.json({
      users: filteredUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.startsWith("Unauthorized") ? 401 : message.startsWith("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}