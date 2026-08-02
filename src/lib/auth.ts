import { currentUser, auth } from "@clerk/nextjs/server";
import { getDb } from "@/src/db";
import { users, subscriptions } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export type UserRole = "member" | "admin" | "super_admin";

function deriveRole(sessionClaims: unknown): UserRole {
  const claims = sessionClaims as { metadata?: { role?: string } } | null | undefined;
  return (claims?.metadata?.role as UserRole) ?? "member";
}

export async function getCurrentUser() {
  return await currentUser();
}

export async function getAuth() {
  return await auth();
}

export async function getUserWithSubscription() {
  const { userId } = await auth();
  if (!userId) return null;

  const db = getDb();
  const [user] = await db
    .select({
      user: users,
      subscription: subscriptions,
    })
    .from(users)
    .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
    .where(eq(users.clerkId, userId))
    .limit(1);

  return user ?? null;
}

export async function getUserRole(): Promise<UserRole> {
  const { sessionClaims } = await auth();
  return deriveRole(sessionClaims);
}

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const role = deriveRole(sessionClaims);
  if (role !== "admin" && role !== "super_admin") {
    throw new Error("Forbidden: Admin access required");
  }
  return userId;
}

export async function requireSuperAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const role = deriveRole(sessionClaims);
  if (role !== "super_admin") {
    throw new Error("Forbidden: Super admin access required");
  }
  return userId;
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const db = getDb();
  const [sub] = await db
    .select({ status: subscriptions.status })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  return sub?.status === "active" || sub?.status === "trialing";
}

export async function hasActiveSubscriptionByClerkId(clerkId: string): Promise<boolean> {
  const db = getDb();
  const [sub] = await db
    .select({ status: subscriptions.status })
    .from(subscriptions)
    .innerJoin(users, eq(subscriptions.userId, users.id))
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  return sub?.status === "active" || sub?.status === "trialing";
}

export async function canAccessPremiumContent(): Promise<boolean> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return false;

  const role = deriveRole(sessionClaims);
  if (role === "admin" || role === "super_admin") return true;

  return await hasActiveSubscriptionByClerkId(userId);
}