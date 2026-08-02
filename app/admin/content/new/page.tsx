import { requireAdmin } from "@/src/lib/auth";
import { getDb } from "@/src/db";
import { tracks } from "@/src/db/schema";
import { asc } from "drizzle-orm";
import { ContentForm } from "@/app/admin/content/ContentForm";

export default async function NewContentPage() {
  await requireAdmin();

  const db = getDb();
  const allTracks = await db
    .select({ id: tracks.id, title: tracks.title })
    .from(tracks)
    .orderBy(asc(tracks.order));

  return (
    <div className="min-h-screen bg-ink pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gradient mb-8">Add Content</h1>
        <ContentForm tracks={allTracks} />
      </div>
    </div>
  );
}
