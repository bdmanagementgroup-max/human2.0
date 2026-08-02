import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn("[human2.0] RESEND_API_KEY not configured, logging email only");
      console.log("[human2.0] New subscriber:", email);
      return NextResponse.json({ success: true, message: "Logged (no provider configured)" });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send welcome email via Resend
    const { data, error } = await resend.emails.send({
      from: "human2.0 <noreply@human2.0>",
      to: email,
      subject: "Welcome to human2.0",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0a0a0f 0%, #12121a 100%); border-radius: 16px; padding: 40px; border: 1px solid #22222e;">
            <!-- Logo/Brand -->
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #00e5ff 0%, #8b5cf6 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; font-weight: 800; letter-spacing: -0.02em;">
                human2.0
              </div>
            </div>

            <!-- Welcome Message -->
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 16px;">
              Welcome to the community!
            </h1>

            <p style="color: #a1a1aa; font-size: 16px; text-align: center; margin: 0 0 32px;">
              Thanks for subscribing. You&apos;ll now receive the latest workshops, tools, and insights from the human2.0 operator community.
            </p>

            <!-- What to Expect -->
            <div style="background: rgba(0, 229, 255, 0.05); border: 1px solid rgba(0, 229, 255, 0.15); border-radius: 12px; padding: 24px; margin-bottom: 32px;">
              <h2 style="color: #00e5ff; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 16px;">
                What to expect
              </h2>
              <ul style="color: #e4e4e7; font-size: 14px; margin: 0; padding-left: 20px; line-height: 2;">
                <li>New workshop releases & playbooks</li>
                <li>AI agent & automation guides</li>
                <li>Voice & video workflow tutorials</li>
                <li>Privacy & security deep-dives</li>
                <li>Community highlights & operator spotlights</li>
              </ul>
            </div>

            <!-- CTA -->
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://human2.0'}/dashboard"
                 style="display: inline-block; background: linear-gradient(180deg, #00e5ff 0%, #00b8cc 100%); color: #0a0a0f; font-weight: 700; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-size: 14px; box-shadow: 0 4px 20px rgba(0, 229, 255, 0.3);">
                Access Your Dashboard
              </a>
            </div>

            <!-- Footer -->
            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #27272a; text-align: center;">
              <p style="color: #71717a; font-size: 12px; margin: 0 0 8px;">
                You&apos;re receiving this because you subscribed to human2.0 updates.
              </p>
              <p style="color: #71717a; font-size: 12px; margin: 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://human2.0'}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #71717a; text-decoration: underline;">
                  Unsubscribe
                </a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send confirmation email" }, { status: 500 });
    }

    console.log("[human2.0] New subscriber:", email, "Resend ID:", data?.id);
    return NextResponse.json({ success: true, message: "Subscribed successfully" });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}