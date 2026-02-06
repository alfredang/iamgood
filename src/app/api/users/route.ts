import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// POST: Register a new user
export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const sql = getDb();
    const result = await sql`
      INSERT INTO users (name, email, role)
      VALUES (${name}, ${email || null}, 'user')
      RETURNING id, name, email, role, created_at
    `;

    return NextResponse.json({ success: true, user: result[0] });
  } catch (error) {
    console.error("Register user error:", error);
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
  }
}

// GET: List all users (admin)
export async function GET() {
  try {
    const sql = getDb();
    const users = await sql`
      SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC
    `;
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Fetch users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
