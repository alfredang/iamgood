import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const sql = getDb();

    const users = await sql`
      SELECT id, name, email, role FROM users
      WHERE email = ${email} AND password_hash = ${password} AND role = 'admin'
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const admin = users[0];

    // Log the admin login
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await sql`
      INSERT INTO admin_logins (admin_id, ip_address, user_agent)
      VALUES (${admin.id}, ${ip}, ${userAgent})
    `;

    // Create a simple session token (in production, use JWT or a session library)
    const token = Buffer.from(`${admin.id}:${admin.email}:${Date.now()}`).toString("base64");

    const response = NextResponse.json({
      success: true,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });

    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
