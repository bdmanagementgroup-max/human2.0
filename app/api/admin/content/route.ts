import { requireAdmin } from "@/src/lib/auth";
import { getDb } from "@/src/db";
import { content, tracks } from "@/src/db/schema";
import { eq, desc, count, asc, and, ilike, type SQL } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const db = getDb();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;
    const trackId = searchParams.get("trackId");
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const conditions: SQL[] = [];
    if (trackId) conditions.push(eq(content.trackId, trackId));
    if (type) conditions.push(eq(content.type, type as typeof content.$inferSelect.type));
    if (search) conditions.push(ilike(content.title, `%${search}%`));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

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
      .where(whereClause)
      .orderBy(desc(content.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count: total }] = await db.select({ count: count() }).from(content).where(whereClause);

    return NextResponse.json({
      content: allContent,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin content fetch error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.startsWith("Unauthorized") ? 401 : message.startsWith("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { title, slug, trackId, type, description, contentBody, videoUrl, durationMinutes, isPublished, isPremium } = body;

    if (!title || !slug || !trackId || !type) {
      return NextResponse.json(
        { error: "title, slug, trackId, and type are required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const [created] = await db
      .insert(content)
      .values({
        title,
        slug,
        trackId,
        type,
        description: description || null,
        body: contentBody || null,
        videoUrl: videoUrl || null,
        durationMinutes: durationMinutes ? Number(durationMinutes) : null,
        isPublished: Boolean(isPublished),
        isPremium: isPremium === undefined ? true : Boolean(isPremium),
        publishedAt: isPublished ? new Date() : null,
      })
      .returning();

    return NextResponse.json(created);
  } catch (error) {
    console.error("Admin content create error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.startsWith("Unauthorized") ? 401 : message.startsWith("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
