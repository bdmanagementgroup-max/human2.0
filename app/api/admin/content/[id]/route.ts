import { requireAdmin } from "@/src/lib/auth";
import { getDb } from "@/src/db";
import { content } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const db = getDb();
    const [item] = await db.select().from(content).where(eq(content.id, id)).limit(1);

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Admin content fetch error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.startsWith("Unauthorized") ? 401 : message.startsWith("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const { title, slug, trackId, type, description, contentBody, videoUrl, durationMinutes, isPublished, isPremium } = body;

    const db = getDb();

    const [existing] = await db.select({ isPublished: content.isPublished, publishedAt: content.publishedAt }).from(content).where(eq(content.id, id)).limit(1);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(content)
      .set({
        title,
        slug,
        trackId,
        type,
        description: description || null,
        body: contentBody || null,
        videoUrl: videoUrl || null,
        durationMinutes: durationMinutes ? Number(durationMinutes) : null,
        isPublished: Boolean(isPublished),
        isPremium: Boolean(isPremium),
        publishedAt: isPublished && !existing.isPublished ? new Date() : existing.publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(content.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin content update error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.startsWith("Unauthorized") ? 401 : message.startsWith("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const db = getDb();
    await db.delete(content).where(eq(content.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin content delete error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.startsWith("Unauthorized") ? 401 : message.startsWith("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
