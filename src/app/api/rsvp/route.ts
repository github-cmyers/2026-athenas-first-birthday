import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ensureRsvpTable, parseRsvpInput, RSVP_TABLE, type RsvpRow } from "@/lib/rsvp";
import { isRsvpOpen } from "@/lib/event";
import { isAuthenticated } from "@/lib/adminSession";

export async function POST(request: NextRequest) {
  // A page left open past the deadline still shows the form, so the deadline
  // is enforced here too. `closed` lets the form switch to the closed notice
  // instead of showing a generic error.
  if (!isRsvpOpen()) {
    return NextResponse.json(
      { error: "RSVPs are closed", closed: true },
      { status: 403 }
    );
  }

  try {
    const body = await request.json().catch(() => null);
    const parsed = parseRsvpInput(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { name, familyMembers, phone, email, attending } = parsed.value;

    await ensureRsvpTable();
    await query(
      `INSERT INTO ${RSVP_TABLE} (Name, FamilyMembers, Phone, Email, Attending) VALUES ($1, $2, $3, $4, $5)`,
      [name, familyMembers, phone, email, attending]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("RSVP submission error:", error);
    return NextResponse.json(
      { error: "Failed to save RSVP" },
      { status: 500 }
    );
  }
}

// The full guest list - names, phone numbers and emails - so admin only.
// Public pages use /api/rsvp/count, which returns totals and nothing personal.
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureRsvpTable();
    const result = await query<RsvpRow>(
      `SELECT * FROM ${RSVP_TABLE} ORDER BY CreatedAt DESC`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("RSVP fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch RSVPs" },
      { status: 500 }
    );
  }
}
