import { getDb, content } from "@/src/db";
import { inArray } from "drizzle-orm";

const slugs = process.argv.slice(2);
if (slugs.length === 0) {
  console.error("Usage: dotenv -e .env.local -- tsx scripts/verify-seed.ts <slug> [<slug> ...]");
  process.exit(1);
}

async function main() {
  const db = getDb();
  const rows = await db
    .select({ slug: content.slug, title: content.title, body: content.body })
    .from(content)
    .where(inArray(content.slug, slugs));

  const found = new Map(rows.map((r) => [r.slug, r]));
  for (const slug of slugs) {
    const row = found.get(slug);
    if (!row) {
      console.log(`MISSING  ${slug}`);
      continue;
    }
    const len = (row.body || "").length;
    const hasHeading = (row.body || "").includes("<h2>");
    console.log(`${len.toString().padStart(6)} chars  h2=${hasHeading ? "y" : "n"}  ${slug}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
