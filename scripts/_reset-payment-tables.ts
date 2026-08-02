import { getDb } from "@/src/db";
import { sql } from "drizzle-orm";

async function main() {
  const db = getDb();

  const subCountResult = await db.execute(sql`SELECT COUNT(*)::int AS count FROM subscriptions`);
  const webhookCountResult = await db.execute(sql`SELECT COUNT(*)::int AS count FROM webhook_events`);

  const subCount = (subCountResult.rows[0] as any)?.count ?? 0;
  const webhookCount = (webhookCountResult.rows[0] as any)?.count ?? 0;

  console.log("subscriptions rows:", subCount);
  console.log("webhook_events rows:", webhookCount);

  if (subCount > 0 || webhookCount > 0) {
    console.log("Non-empty — aborting, not dropping.");
    process.exit(1);
  }

  await db.execute(sql`DROP TABLE IF EXISTS subscriptions CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS webhook_events CASCADE`);
  console.log("Dropped subscriptions and webhook_events (were empty).");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
