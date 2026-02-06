import { NextRequest, NextResponse } from "next/server";

// This endpoint is designed to be called by Vercel Cron Jobs
// In vercel.json, configure: { "crons": [{ "path": "/api/cron", "schedule": "*/15 * * * *" }] }
// Since this MVP uses localStorage (client-side), the cron endpoint acts as a health check.
// In a production app with a database, this would query all users with overdue check-ins
// and trigger alerts for each.

export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // In this MVP, the client handles check-in monitoring and triggers alerts.
  // This endpoint serves as a placeholder for a database-backed implementation.
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    message: "Cron health check passed. Client-side monitoring active.",
  });
}
