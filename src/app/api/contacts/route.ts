import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET: Fetch contacts for a user
export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    let contacts;
    if (userId) {
      contacts = await sql`
        SELECT * FROM emergency_contacts WHERE user_id = ${Number(userId)} ORDER BY created_at
      `;
    } else {
      contacts = await sql`
        SELECT ec.*, u.name as user_name FROM emergency_contacts ec
        JOIN users u ON u.id = ec.user_id ORDER BY ec.created_at
      `;
    }

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("Fetch contacts error:", error);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

// POST: Add a new contact
export async function POST(request: NextRequest) {
  try {
    const { userId, name, email, phone, relationship } = await request.json();
    if (!userId || !name || !email) {
      return NextResponse.json({ error: "userId, name, and email required" }, { status: 400 });
    }

    const sql = getDb();
    const result = await sql`
      INSERT INTO emergency_contacts (user_id, name, email, phone, relationship)
      VALUES (${userId}, ${name}, ${email}, ${phone || null}, ${relationship || null})
      RETURNING *
    `;

    return NextResponse.json({ success: true, contact: result[0] });
  } catch (error) {
    console.error("Add contact error:", error);
    return NextResponse.json({ error: "Failed to add contact" }, { status: 500 });
  }
}

// PUT: Update a contact
export async function PUT(request: NextRequest) {
  try {
    const { id, name, email, phone, relationship } = await request.json();
    if (!id || !name || !email) {
      return NextResponse.json({ error: "id, name, and email required" }, { status: 400 });
    }

    const sql = getDb();
    const result = await sql`
      UPDATE emergency_contacts
      SET name = ${name}, email = ${email}, phone = ${phone || null}, relationship = ${relationship || null}
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({ success: true, contact: result[0] });
  } catch (error) {
    console.error("Update contact error:", error);
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
  }
}

// DELETE: Remove a contact
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Contact id required" }, { status: 400 });
    }

    const sql = getDb();
    await sql`DELETE FROM emergency_contacts WHERE id = ${Number(id)}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete contact error:", error);
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 });
  }
}
