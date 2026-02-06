import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Called by Vercel Cron (daily) — checks all users for missed check-ins
// and auto-triggers alerts to their emergency contacts.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();

  try {
    // Find users whose last check-in is older than their configured interval + grace period
    // Default: 24 hours + 60 minutes if no schedule is set
    const overdueUsers = await sql`
      SELECT
        u.id as user_id,
        u.name as user_name,
        COALESCE(s.check_in_interval_hours, 24) as interval_hours,
        COALESCE(s.grace_period_minutes, 60) as grace_minutes,
        last_ci.last_checkin
      FROM users u
      LEFT JOIN user_schedules s ON s.user_id = u.id
      LEFT JOIN (
        SELECT user_id, MAX(checked_in_at) as last_checkin
        FROM check_in_logs
        GROUP BY user_id
      ) last_ci ON last_ci.user_id = u.id
      WHERE u.role = 'user'
        AND COALESCE(s.alert_enabled, true) = true
        AND last_ci.last_checkin IS NOT NULL
        AND last_ci.last_checkin < NOW() - (
          COALESCE(s.check_in_interval_hours, 24) * INTERVAL '1 hour'
          + COALESCE(s.grace_period_minutes, 60) * INTERVAL '1 minute'
        )
    `;

    const alertResults: { userId: number; userName: string; contactsNotified: number }[] = [];

    for (const user of overdueUsers) {
      // Don't alert if we already alerted within the last interval
      const recentAlert = await sql`
        SELECT id FROM alert_logs
        WHERE user_id = ${user.user_id}
          AND sent_at > NOW() - (${Number(user.interval_hours)} * INTERVAL '1 hour')
        LIMIT 1
      `;

      if (recentAlert.length > 0) continue;

      // Get emergency contacts for this user
      const contacts = await sql`
        SELECT id, name, email, phone FROM emergency_contacts WHERE user_id = ${user.user_id}
      `;

      if (contacts.length === 0) continue;

      // Trigger alerts via the alert API
      const baseUrl = request.headers.get("x-forwarded-proto") === "https"
        ? `https://${request.headers.get("host")}`
        : `http://${request.headers.get("host")}`;

      const alertRes = await fetch(`${baseUrl}/api/alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: user.user_name,
          userId: user.user_id,
          contacts: contacts.map((c: Record<string, unknown>) => ({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
          })),
        }),
      });

      const alertData = await alertRes.json();
      alertResults.push({
        userId: user.user_id,
        userName: user.user_name,
        contactsNotified: alertData.details?.filter((d: { status: string }) => d.status === "sent").length || 0,
      });
    }

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      overdueUsers: overdueUsers.length,
      alertsTriggered: alertResults.length,
      details: alertResults,
    });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Cron check failed", details: String(error) }, { status: 500 });
  }
}
