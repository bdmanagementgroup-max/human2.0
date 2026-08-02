import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { getDb } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;

const VALID_ROLES = ["member", "admin", "super_admin"] as const;
type UserRole = (typeof VALID_ROLES)[number];

function normalizeRole(role: unknown): UserRole {
  return VALID_ROLES.includes(role as UserRole) ? (role as UserRole) : "member";
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const headers = request.headers;

    const svixId = headers.get("svix-id");
    const svixTimestamp = headers.get("svix-timestamp");
    const svixSignature = headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
    }

    const wh = new Webhook(webhookSecret);

    let evt: any;
    try {
      evt = wh.verify(JSON.stringify(payload), {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
    }

    const db = getDb();
    const { type, data } = evt;

    switch (type) {
      case "user.created": {
        await db.insert(users).values({
          clerkId: data.id,
          email: data.email_addresses[0]?.email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          imageUrl: data.image_url,
          role: normalizeRole(data.public_metadata?.role),
        });
        break;
      }

      case "user.updated": {
        await db
          .update(users)
          .set({
            email: data.email_addresses[0]?.email_address,
            firstName: data.first_name,
            lastName: data.last_name,
            imageUrl: data.image_url,
            role: normalizeRole(data.public_metadata?.role),
            updatedAt: new Date(),
          })
          .where(eq(users.clerkId, data.id));
        break;
      }

      case "user.deleted": {
        // Soft delete - just mark as deleted
        await db
          .update(users)
          .set({
            email: `deleted_${data.id}@deleted.com`,
            firstName: "Deleted",
            lastName: "User",
            updatedAt: new Date(),
          })
          .where(eq(users.clerkId, data.id));
        break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clerk webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}