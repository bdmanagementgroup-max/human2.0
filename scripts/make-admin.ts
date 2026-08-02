import { getDb } from "@/src/db";
import { users, subscriptions } from "@/src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const db = getDb();
  const email = "fx13enz@gmail.com";

  // Find user by email
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    console.error(`User with email ${email} not found in database.`);
    console.error("Make sure they've signed up via Clerk first so the webhook syncs them.");
    process.exit(1);
  }

  console.log(`Found user: ${user.email} (clerkId: ${user.clerkId}, current role: ${user.role})`);

  // Update role to super_admin
  await db
    .update(users)
    .set({ role: "super_admin", updatedAt: new Date() })
    .where(eq(users.id, user.id));

  console.log("Updated role to super_admin");

  // Create or update subscription to active
  const [existingSub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .limit(1);

  const now = new Date();
  const periodEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

  if (existingSub) {
    await db
      .update(subscriptions)
      .set({
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        canceledAt: null,
        updatedAt: now,
      })
      .where(eq(subscriptions.userId, user.id));
    console.log("Updated existing subscription to active");
  } else {
    await db.insert(subscriptions).values({
      userId: user.id,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      paypalPlanId: "manual_admin_grant",
    });
    console.log("Created new active subscription");
  }

  console.log("\nDone! The user now has:");
  console.log("  - Role: super_admin (bypasses all paywalls)");
  console.log("  - Subscription: active (premium access)");
  console.log("\nThey may need to sign out and back in for the role to reflect in sessionClaims.");

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});