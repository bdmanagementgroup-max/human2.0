import { requireAdmin } from "@/src/lib/auth";
import { getDb } from "@/src/db";
import { tracks, content } from "@/src/db/schema";
import { eq, asc, count } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const db = getDb();

    const allTracks = await db
      .select({
        id: tracks.id,
        key: tracks.key,
        title: tracks.title,
        description: tracks.description,
        icon: tracks.icon,
        color: tracks.color,
        order: tracks.order,
        isActive: tracks.isActive,
        createdAt: tracks.createdAt,
        updatedAt: tracks.updatedAt,
        contentCount: count(content.id),
      })
      .from(tracks)
      .leftJoin(content, eq(tracks.id, content.trackId))
      .groupBy(tracks.id)
      .orderBy(asc(tracks.order));

    return NextResponse.json({ tracks: allTracks });
  } catch (error) {
    console.error("Admin tracks fetch error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.startsWith("Unauthorized") ? 401 : message.startsWith("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const db = getDb();

    const body = await request.json();
    const { key, title, description, icon, color, order, isActive } = body;

    if (!key || !title) {
      return NextResponse.json({ error: "key and title are required" }, { status: 400 });
    }

    const [created] = await db
      .insert(tracks)
      .values({
        key,
        title,
        description: description || null,
        icon: icon || null,
        color: color || "cyan",
        order: order || 0,
        isActive: isActive ?? true,
      })
      .returning();

    return NextResponse.json(created);
  } catch (error) {
    console.error("Admin track create error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.startsWith("Unauthorized") ? 401 : message.startsWith("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}