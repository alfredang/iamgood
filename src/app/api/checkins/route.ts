import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// POST: Record a new check-in
export async function POST(request: NextRequest) {
  try {
    const { userId, healthTag, note } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const sql = getDb();
    const result = await sql`
      INSERT INTO check_in_logs (user_id, health_tag, note)
      VALUES (${userId}, ${healthTag || "okay"}, ${note || null})
      RETURNING id, user_id, health_tag, note, checked_in_at
    `;

    return NextResponse.json({ success: true, checkIn: result[0] });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json({ error: "Failed to record check-in" }, { status: 500 });
  }
}

// GET: Fetch check-in history (admin or user)
export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);
    const offset = Number(searchParams.get("offset")) || 0;

    let logs;
    if (userId) {
      logs = await sql`
        SELECT cl.id, cl.health_tag, cl.note, cl.checked_in_at, u.name as user_name
        FROM check_in_logs cl
        JOIN users u ON u.id = cl.user_id
        WHERE cl.user_id = ${Number(userId)}
        ORDER BY cl.checked_in_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      logs = await sql`
        SELECT cl.id, cl.user_id, cl.health_tag, cl.note, cl.checked_in_at, u.name as user_name
        FROM check_in_logs cl
        JOIN users u ON u.id = cl.user_id
        ORDER BY cl.checked_in_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Fetch check-ins error:", error);
    return NextResponse.json({ error: "Failed to fetch check-ins" }, { status: 500 });
  }
}
