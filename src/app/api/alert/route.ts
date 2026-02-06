import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

interface ContactPayload {
  id?: number;
  name: string;
  email: string;
  phone?: string;
}

interface AlertRequest {
  userName: string;
  userId?: number;
  contacts: ContactPayload[];
}

export async function POST(request: NextRequest) {
  try {
    const body: AlertRequest = await request.json();
    const { userName, userId, contacts } = body;

    if (!userName || !contacts?.length) {
      return NextResponse.json({ error: "Missing userName or contacts" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const sql = getDb();
    const results: { type: string; contact: string; status: string }[] = [];

    for (const contact of contacts) {
      // --- Send Email ---
      let emailStatus: "sent" | "failed" = "failed";
      if (apiKey) {
        try {
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
              html: buildEmailHtml(userName, contact.name),
            }),
          });
          emailStatus = res.ok ? "sent" : "failed";
        } catch {
          emailStatus = "failed";
        }
      }

      // Log email alert to DB
      if (userId) {
        await sql`
          INSERT INTO alert_logs (user_id, contact_id, alert_type, status, message)
          VALUES (${userId}, ${contact.id || null}, 'email', ${emailStatus},
                  ${`Alert email to ${contact.name} <${contact.email}>`})
        `;
      }
      results.push({ type: "email", contact: contact.email, status: emailStatus });

      // --- Send SMS via email-to-SMS gateway ---
      if (contact.phone && apiKey) {
        let smsStatus: "sent" | "failed" = "failed";
        const smsEmail = buildSmsGatewayEmail(contact.phone);
        if (smsEmail) {
          try {
            const res = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: "SafeCheck <onboarding@resend.dev>",
                to: [smsEmail],
                subject: "SafeCheck Alert",
                text: `SafeCheck Alert: ${userName} has missed their safety check-in. Please check on them.`,
              }),
            });
            smsStatus = res.ok ? "sent" : "failed";
          } catch {
            smsStatus = "failed";
          }
        }

        if (userId) {
          await sql`
            INSERT INTO alert_logs (user_id, contact_id, alert_type, status, message)
            VALUES (${userId}, ${contact.id || null}, 'sms', ${smsStatus},
                    ${`SMS to ${contact.name} at ${contact.phone}`})
          `;
        }
        results.push({ type: "sms", contact: contact.phone, status: smsStatus });
      }
    }

    const sent = results.filter((r) => r.status === "sent").length;
    return NextResponse.json({
      success: true,
      message: `${sent} of ${results.length} notifications sent`,
      details: results,
    });
  } catch (error) {
    console.error("[SafeCheck Alert Error]", error);
    return NextResponse.json({ error: "Failed to send alert" }, { status: 500 });
  }
}

function buildEmailHtml(userName: string, contactName: string): string {
  return `
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
        Hi ${contactName},
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
  `;
}

// Common US carrier email-to-SMS gateways
function buildSmsGatewayEmail(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  const number = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  // Default to T-Mobile gateway; in production, let user select carrier or use a proper SMS API
  return `${number}@tmomail.net`;
}
