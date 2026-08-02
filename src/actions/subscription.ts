"use server";

import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/src/db";
import { users, subscriptions } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { createSubscription, cancelSubscription as cancelPaypalSubscription } from "@/src/lib/paypal";
import { getOrCreateCurrentUser } from "@/src/lib/auth";

export async function createCheckoutSession(planId?: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const db = getDb();
  const user = await getOrCreateCurrentUser();

  if (!user) {
    throw new Error("User not found");
  }

  const resolvedPlanId = planId || process.env.PAYPAL_PLAN_ID;
  if (!resolvedPlanId) {
    throw new Error("Missing PayPal plan ID");
  }

  const subscription = await createSubscription(resolvedPlanId, user.id);

  await db
    .insert(subscriptions)
    .values({
      userId: user.id,
      paypalSubscriptionId: subscription.id,
      paypalPlanId: resolvedPlanId,
      status: "incomplete",
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        paypalSubscriptionId: subscription.id,
        paypalPlanId: resolvedPlanId,
        status: "incomplete",
        updatedAt: new Date(),
      },
    });

  const approveLink = subscription.links.find((l) => l.rel === "approve")?.href;
  if (!approveLink) {
    throw new Error("PayPal did not return an approval link");
  }

  return { url: approveLink };
}

export async function cancelSubscription() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const db = getDb();
  const [row] = await db
    .select({ paypalSubscriptionId: subscriptions.paypalSubscriptionId })
    .from(users)
    .innerJoin(subscriptions, eq(subscriptions.userId, users.id))
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (!row?.paypalSubscriptionId) {
    throw new Error("No PayPal subscription found");
  }

  await cancelPaypalSubscription(row.paypalSubscriptionId, "Canceled by user from dashboard");

  await db
    .update(subscriptions)
    .set({ status: "canceled", canceledAt: new Date(), updatedAt: new Date() })
    .where(eq(subscriptions.paypalSubscriptionId, row.paypalSubscriptionId));

  return { success: true };
}
