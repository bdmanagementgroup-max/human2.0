import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/src/db";
import { subscriptions, webhookEvents } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { verifyWebhookSignature, mapPaypalStatus } from "@/src/lib/paypal";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headersList = request.headers;

    const transmissionId = headersList.get("paypal-transmission-id");
    const transmissionTime = headersList.get("paypal-transmission-time");
    const certUrl = headersList.get("paypal-cert-url");
    const authAlgo = headersList.get("paypal-auth-algo");
    const transmissionSig = headersList.get("paypal-transmission-sig");

    if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
      return NextResponse.json({ error: "Missing PayPal webhook headers" }, { status: 400 });
    }

    const verified = await verifyWebhookSignature(
      { transmissionId, transmissionTime, certUrl, authAlgo, transmissionSig },
      body
    );

    if (!verified) {
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
    }

    const db = getDb();
    const eventId: string = body.id;
    const eventType: string = body.event_type;

    const [existing] = await db
      .select({ id: webhookEvents.id })
      .from(webhookEvents)
      .where(eq(webhookEvents.paypalEventId, eventId))
      .limit(1);

    if (existing) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    await db.insert(webhookEvents).values({
      paypalEventId: eventId,
      type: eventType,
      payload: JSON.stringify(body),
      processed: false,
    });

    switch (eventType) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
      case "BILLING.SUBSCRIPTION.UPDATED":
      case "BILLING.SUBSCRIPTION.SUSPENDED":
      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.EXPIRED": {
        const resource = body.resource;
        const paypalSubscriptionId: string = resource.id;
        const status = mapPaypalStatus(resource.status);

        await db
          .update(subscriptions)
          .set({
            status,
            paypalPayerId: resource.subscriber?.payer_id,
            currentPeriodEnd: resource.billing_info?.next_billing_time
              ? new Date(resource.billing_info.next_billing_time)
              : undefined,
            canceledAt: status === "canceled" ? new Date() : undefined,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.paypalSubscriptionId, paypalSubscriptionId));
        break;
      }

      case "PAYMENT.SALE.COMPLETED": {
        const paypalSubscriptionId: string | undefined = body.resource?.billing_agreement_id;
        if (paypalSubscriptionId) {
          await db
            .update(subscriptions)
            .set({ status: "active", updatedAt: new Date() })
            .where(eq(subscriptions.paypalSubscriptionId, paypalSubscriptionId));
        }
        break;
      }

      default:
        console.log(`Unhandled PayPal event type: ${eventType}`);
    }

    await db
      .update(webhookEvents)
      .set({ processed: true, processedAt: new Date() })
      .where(eq(webhookEvents.paypalEventId, eventId));

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PayPal webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
