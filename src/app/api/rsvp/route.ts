import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ensureRsvpTable, RSVP_TABLE } from "@/lib/rsvp";
import { MAX_FAMILY_MEMBERS } from "@/lib/event";

export async function POST(request: NextRequest) {
  try {
    await ensureRsvpTable();

    const body = await request.json();
    const { name, familyMembers, phone, email, attending } = body;

    if (!name || !phone || !email) {
      return NextResponse.json(
        { error: "Name, phone, and email are required" },
        { status: 400 }
      );
    }

    if (typeof attending !== "boolean") {
      return NextResponse.json(
        { error: "An attending response is required" },
        { status: 400 }
      );
    }

    // Someone who is not coming brings no one, whatever was sent. Anyone who
    // is coming counts at least themselves, and is capped at the same limit
    // the form offers - a request is not trusted to have come from the form.
    const headcount = attending ? Number(familyMembers) : 0;

    if (
      attending &&
      (!Number.isInteger(headcount) ||
        headcount < 1 ||
        headcount > MAX_FAMILY_MEMBERS)
    ) {
      return NextResponse.json(
        {
          error: `Number of attending family members must be between 1 and ${MAX_FAMILY_MEMBERS}`,
        },
        { status: 400 }
      );
    }

    await query(
      `INSERT INTO ${RSVP_TABLE} (Name, FamilyMembers, Phone, Email, Attending) VALUES ($1, $2, $3, $4, $5)`,
      [name, headcount, phone, email, attending]
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

export async function GET() {
  try {
    await ensureRsvpTable();
    const result = await query<{
      id: number;
      name: string;
      familymembers: number;
      phone: string;
      email: string;
      attending: boolean;
      createdat: Date;
    }>(`SELECT * FROM ${RSVP_TABLE} ORDER BY CreatedAt DESC`);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("RSVP fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch RSVPs" },
      { status: 500 }
    );
  }
}
