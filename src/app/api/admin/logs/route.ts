import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET: Fetch admin login history and all activity logs
export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);

    const result: Record<string, unknown> = {};

    if (type === "all" || type === "admin_logins") {
      result.adminLogins = await sql`
        SELECT al.id, al.ip_address, al.user_agent, al.logged_in_at, u.name, u.email
        FROM admin_logins al
        JOIN users u ON u.id = al.admin_id
        ORDER BY al.logged_in_at DESC
        LIMIT ${limit}
      `;
    }

    if (type === "all" || type === "checkins") {
      result.checkIns = await sql`
        SELECT cl.id, cl.health_tag, cl.note, cl.checked_in_at, u.name as user_name, u.id as user_id
        FROM check_in_logs cl
        JOIN users u ON u.id = cl.user_id
        ORDER BY cl.checked_in_at DESC
        LIMIT ${limit}
      `;
    }

    if (type === "all" || type === "alerts") {
      result.alerts = await sql`
        SELECT al.id, al.alert_type, al.status, al.message, al.sent_at,
               u.name as user_name, ec.name as contact_name, ec.email as contact_email
        FROM alert_logs al
        LEFT JOIN users u ON u.id = al.user_id
        LEFT JOIN emergency_contacts ec ON ec.id = al.contact_id
        ORDER BY al.sent_at DESC
        LIMIT ${limit}
      `;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Fetch admin logs error:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
