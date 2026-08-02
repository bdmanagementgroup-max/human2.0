import { requireAdmin } from "@/src/lib/auth";
import { getDb } from "@/src/db";
import { users, subscriptions, content, tracks } from "@/src/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { AdminDashboardClient } from "./AdminDashboardClient";

export default async function AdminDashboardPage() {
  const userId = await requireAdmin();
  const db = getDb();

  // Fetch stats
  const [userCount] = await db.select({ count: count() }).from(users);
  const [subCount] = await db
    .select({ count: count() })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"));
  const [contentCount] = await db.select({ count: count() }).from(content);
  const [trackCount] = await db.select({ count: count() }).from(tracks);

  // Fetch recent users for initial render
  const recentUsers = await db
    .select({
      id: users.id,
      clerkId: users.clerkId,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      createdAt: users.createdAt,
      subscriptionStatus: subscriptions.status,
    })
    .from(users)
    .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
    .orderBy(desc(users.createdAt))
    .limit(20);

  // Convert dates to strings for client component
  const initialUsers = recentUsers.map((user) => ({
    ...user,
    createdAt: user.createdAt ? user.createdAt.toISOString() : null,
  }));

  // Fetch all content for initial render
  const allContent = await db
    .select({
      id: content.id,
      title: content.title,
      slug: content.slug,
      trackId: content.trackId,
      type: content.type,
      isPublished: content.isPublished,
      isPremium: content.isPremium,
      createdAt: content.createdAt,
      trackTitle: tracks.title,
    })
    .from(content)
    .leftJoin(tracks, eq(content.trackId, tracks.id))
    .orderBy(desc(content.createdAt))
    .limit(20);

  // Convert dates to strings for client component
  const initialContent = allContent.map((item) => ({
    ...item,
    createdAt: item.createdAt ? item.createdAt.toISOString() : null,
  }));

  return (
    <AdminDashboardClient
      initialStats={{
        userCount: userCount.count,
        activeSubCount: subCount.count,
        contentCount: contentCount.count,
        trackCount: trackCount.count,
      }}
      initialUsers={initialUsers}
      initialContent={initialContent}
    />
  );
}