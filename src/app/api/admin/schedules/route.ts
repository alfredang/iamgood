import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET: Fetch all user schedules
export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const sql = getDb();
    const schedules = await sql`
      SELECT
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        COALESCE(s.check_in_interval_hours, 24) as check_in_interval_hours,
        COALESCE(s.grace_period_minutes, 60) as grace_period_minutes,
        COALESCE(s.alert_enabled, true) as alert_enabled,
        s.updated_at,
        last_ci.last_checkin,
        last_ci.last_health_tag
      FROM users u
      LEFT JOIN user_schedules s ON s.user_id = u.id
      LEFT JOIN (
        SELECT DISTINCT ON (user_id) user_id, checked_in_at as last_checkin, health_tag as last_health_tag
        FROM check_in_logs
        ORDER BY user_id, checked_in_at DESC
      ) last_ci ON last_ci.user_id = u.id
      WHERE u.role = 'user'
      ORDER BY u.name
    `;
    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("Fetch schedules error:", error);
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  }
}

// PUT: Update a user's schedule
export async function PUT(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { userId, checkInIntervalHours, gracePeriodMinutes, alertEnabled } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const sql = getDb();

    // Upsert the schedule
    await sql`
      INSERT INTO user_schedules (user_id, check_in_interval_hours, grace_period_minutes, alert_enabled, updated_at)
      VALUES (${userId}, ${checkInIntervalHours ?? 24}, ${gracePeriodMinutes ?? 60}, ${alertEnabled !== false}, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        check_in_interval_hours = ${checkInIntervalHours ?? 24},
        grace_period_minutes = ${gracePeriodMinutes ?? 60},
        alert_enabled = ${alertEnabled !== false},
        updated_at = NOW()
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update schedule error:", error);
    return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
  }
}
