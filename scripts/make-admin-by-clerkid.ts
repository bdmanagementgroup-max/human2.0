import { getDb } from "@/src/db";
import { users, subscriptions } from "@/src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const db = getDb();

  // REPLACE THIS with the actual Clerk user ID from Clerk Dashboard
  const clerkId = process.argv[2] || "user_xxx_from_clerk_dashboard";
  const email = "fx13enz@gmail.com";

  if (clerkId === "user_xxx_from_clerk_dashboard") {
    console.error("Usage: npx tsx scripts/make-admin-by-clerkid.ts <clerk_user_id>");
    console.error("Get the Clerk user ID from: Clerk Dashboard → Users → click user → copy 'user_xxx' ID");
    process.exit(1);
  }

  // Insert or update user
  await db
    .insert(users)
    .values({ clerkId, email, role: "super_admin" })
    .onConflictDoUpdate({ target: users.clerkId, set: { role: "super_admin", email } });

  const [u] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  if (!u) {
    console.error("Failed to find/create user");
    process.exit(1);
  }

  console.log(`User: ${u.email} (${u.clerkId}) - role: ${u.role}`);

  // Create or update subscription
  await db
    .insert(subscriptions)
    .values({
      userId: u.id,
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      paypalPlanId: "manual_admin_grant",
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        canceledAt: null,
        updatedAt: new Date(),
      },
    });

  console.log("Subscription set to active");
  console.log("\nDone! User now has super_admin role + active subscription.");
  console.log("Have them sign out and back in to refresh session.");

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});