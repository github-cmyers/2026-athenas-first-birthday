import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  ensureRsvpTable,
  parseRsvpId,
  parseRsvpInput,
  RSVP_COLUMNS,
  RSVP_TABLE,
  type RsvpRow,
} from "@/lib/rsvp";
import { isAuthenticated } from "@/lib/adminSession";

type Params = { params: Promise<{ id: string }> };

// Admin correction of an existing RSVP. The same validation as the public
// form applies, and the RSVP deadline does not - hosts can fix the list at
// any time.
export async function PATCH(request: NextRequest, { params }: Params) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rsvpId = parseRsvpId((await params).id);
    if (rsvpId === null) {
      return NextResponse.json({ error: "Invalid RSVP id" }, { status: 400 });
    }

    const parsed = parseRsvpInput(await request.json().catch(() => null));
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { name, familyMembers, phone, email, attending } = parsed.value;

    await ensureRsvpTable();

    const result = await query<RsvpRow>(
      `UPDATE ${RSVP_TABLE}
         SET Name = $1, FamilyMembers = $2, Phone = $3, Email = $4, Attending = $5
       WHERE Id = $6
       RETURNING ${RSVP_COLUMNS}`,
      [name, familyMembers, phone, email, attending, rsvpId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "RSVP not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("RSVP update error:", error);
    return NextResponse.json(
      { error: "Failed to update RSVP" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  // This endpoint destroys data, so it is refused outright without a valid
  // admin session - never rely on the admin page being the only caller.
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rsvpId = parseRsvpId((await params).id);
    if (rsvpId === null) {
      return NextResponse.json({ error: "Invalid RSVP id" }, { status: 400 });
    }

    await ensureRsvpTable();

    const result = await query<{ id: number }>(
      `DELETE FROM ${RSVP_TABLE} WHERE Id = $1 RETURNING Id`,
      [rsvpId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "RSVP not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: rsvpId });
  } catch (error) {
    console.error("RSVP delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete RSVP" },
      { status: 500 }
    );
  }
}
