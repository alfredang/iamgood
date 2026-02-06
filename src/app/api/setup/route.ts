import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  const setupSecret = request.headers.get("x-setup-secret");
  if (setupSecret !== process.env.CRON_SECRET && setupSecret !== "initial-setup") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        password_hash VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS check_in_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        health_tag VARCHAR(20) NOT NULL DEFAULT 'okay',
        note TEXT,
        checked_in_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS emergency_contacts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        relationship VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS admin_logins (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ip_address VARCHAR(45),
        user_agent TEXT,
        logged_in_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS alert_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        contact_id INTEGER REFERENCES emergency_contacts(id) ON DELETE SET NULL,
        alert_type VARCHAR(20) NOT NULL DEFAULT 'email' CHECK (alert_type IN ('email', 'sms')),
        status VARCHAR(20) NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
        message TEXT,
        sent_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_schedules (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        check_in_interval_hours INTEGER NOT NULL DEFAULT 24,
        grace_period_minutes INTEGER NOT NULL DEFAULT 60,
        alert_enabled BOOLEAN DEFAULT true,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Create default admin if none exists
    const existing = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`;
    if (existing.length === 0) {
      await sql`
        INSERT INTO users (name, email, role, password_hash)
        VALUES ('Admin', 'admin@safecheck.app', 'admin', 'admin123')
      `;
    }

    return NextResponse.json({ success: true, message: "Database tables created successfully" });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Setup failed", details: String(error) }, { status: 500 });
  }
}
