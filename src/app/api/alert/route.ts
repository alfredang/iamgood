import { NextRequest, NextResponse } from "next/server";

interface AlertRequest {
  userName: string;
  contacts: { name: string; email: string }[];
}

export async function POST(request: NextRequest) {
  try {
    const body: AlertRequest = await request.json();
    const { userName, contacts } = body;

    if (!userName || !contacts?.length) {
      return NextResponse.json({ error: "Missing userName or contacts" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      // Log the alert even without email service
      console.log(`[SafeCheck Alert] ${userName} has missed their safety check-in.`);
      console.log(`Would notify: ${contacts.map((c) => `${c.name} <${c.email}>`).join(", ")}`);
      return NextResponse.json({
        success: true,
        message: "Alert logged (email service not configured)",
        notified: contacts.length,
      });
    }

    // Send emails via Resend
    const results = await Promise.allSettled(
      contacts.map(async (contact) => {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "SafeCheck <onboarding@resend.dev>",
            to: [contact.email],
            subject: `Safety Alert: ${userName} has missed their check-in`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <div style="width: 64px; height: 64px; border-radius: 50%; background: #FEF3C7; display: inline-flex; align-items: center; justify-content: center;">
                    <span style="font-size: 28px;">&#9888;</span>
                  </div>
                </div>
                <h1 style="color: #292524; font-size: 22px; text-align: center; margin-bottom: 16px;">
                  Safety Check-in Alert
                </h1>
                <p style="color: #57534e; font-size: 16px; line-height: 1.6; text-align: center;">
                  Hi ${contact.name},
                </p>
                <p style="color: #57534e; font-size: 16px; line-height: 1.6; text-align: center;">
                  <strong>${userName}</strong> has missed their scheduled safety check-in on SafeCheck.
                  This may be nothing to worry about, but we wanted to let you know.
                </p>
                <div style="background: #FAF9F6; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
                  <p style="color: #78716c; font-size: 14px; margin: 0 0 4px 0;">Missed at</p>
                  <p style="color: #292524; font-size: 18px; font-weight: 600; margin: 0;">
                    ${new Date().toLocaleString()}
                  </p>
                </div>
                <p style="color: #78716c; font-size: 14px; line-height: 1.5; text-align: center;">
                  Consider reaching out to ${userName} to make sure they are okay.
                </p>
                <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 24px 0;" />
                <p style="color: #a8a29e; font-size: 12px; text-align: center;">
                  This alert was sent by SafeCheck — a personal safety check-in companion.
                </p>
              </div>
            `,
          }),
        });
        if (!res.ok) {
          const err = await res.text();
          throw new Error(`Failed to send to ${contact.email}: ${err}`);
        }
        return contact.email;
      })
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      message: `Alert sent to ${sent} contact(s)${failed > 0 ? `, ${failed} failed` : ""}`,
      notified: sent,
    });
  } catch (error) {
    console.error("[SafeCheck Alert Error]", error);
    return NextResponse.json({ error: "Failed to send alert" }, { status: 500 });
  }
}
