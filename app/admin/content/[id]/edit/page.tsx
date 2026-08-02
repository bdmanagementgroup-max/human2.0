import { requireAdmin } from "@/src/lib/auth";
import { getDb } from "@/src/db";
import { tracks, content } from "@/src/db/schema";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ContentForm } from "@/app/admin/content/ContentForm";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const db = getDb();
  const [allTracks, [item]] = await Promise.all([
    db.select({ id: tracks.id, title: tracks.title }).from(tracks).orderBy(asc(tracks.order)),
    db.select().from(content).where(eq(content.id, id)).limit(1),
  ]);

  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-ink pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gradient mb-8">Edit Content</h1>
        <ContentForm
          tracks={allTracks}
          initialValues={{
            id: item.id,
            title: item.title,
            slug: item.slug,
            trackId: item.trackId,
            type: item.type,
            description: item.description ?? "",
            contentBody: item.body ?? "",
            videoUrl: item.videoUrl ?? "",
            durationMinutes: item.durationMinutes?.toString() ?? "",
            isPublished: item.isPublished,
            isPremium: item.isPremium,
          }}
        />
      </div>
    </div>
  );
}
