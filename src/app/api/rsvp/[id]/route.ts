import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ensureRsvpTable, RSVP_TABLE } from "@/lib/rsvp";
import { isAuthenticated } from "@/lib/adminSession";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // This endpoint destroys data, so it is refused outright without a valid
  // admin session - never rely on the admin page being the only caller.
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const rsvpId = Number(id);

    if (!Number.isInteger(rsvpId) || rsvpId <= 0) {
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
