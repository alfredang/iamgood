import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const decoded = Buffer.from(token, "base64").toString();
    const [adminId] = decoded.split(":");
    const sql = getDb();

    const users = await sql`
      SELECT id, name, email, role FROM users WHERE id = ${Number(adminId)} AND role = 'admin' LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json({ admin: users[0] });
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}
