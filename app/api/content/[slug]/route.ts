import { getDb } from "@/src/db";
import { content, tracks } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { canAccessPremiumContent, getUserRole } from "@/src/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = getDb();

    const [item] = await db
      .select({
        id: content.id,
        title: content.title,
        slug: content.slug,
        description: content.description,
        content: content.body,
        type: content.type,
        trackId: content.trackId,
        trackTitle: tracks.title,
        isPublished: content.isPublished,
        requiresSubscription: content.isPremium,
        videoUrl: content.videoUrl,
        durationMinutes: content.durationMinutes,
        difficulty: content.difficulty,
      })
      .from(content)
      .leftJoin(tracks, eq(content.trackId, tracks.id))
      .where(eq(content.slug, slug))
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const role = await getUserRole();
    const isAdmin = role === "admin" || role === "super_admin";

    if (!item.isPublished && !isAdmin) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (item.requiresSubscription && !(await canAccessPremiumContent())) {
      // Ship metadata for the UI gate, but withhold the body itself —
      // access must be enforced here, not just by the client choosing not to render it.
      return NextResponse.json({ ...item, content: null, videoUrl: null });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Content fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}