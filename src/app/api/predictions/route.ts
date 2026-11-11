import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ensureRsvpTable, RSVP_TABLE } from "@/lib/rsvp";
import { parsePredictionSubmission } from "@/lib/predictions";

// Saves a guest's "Predictions for Athena" onto the RSVP they just sent. The
// token comes from that RSVP's response, so predictions can only ever be
// attached to your own reply. Sending again replaces the earlier picks.
export async function POST(request: NextRequest) {
  try {
    const parsed = parsePredictionSubmission(await request.json().catch(() => null));
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { token, answers } = parsed.value;

    await ensureRsvpTable();
    const result = await query<{ id: number }>(
      `UPDATE ${RSVP_TABLE} SET Predictions = $1 WHERE PredictionToken = $2 RETURNING Id`,
      [JSON.stringify(answers), token]
    );

    // No match: a made-up token, or the host has since removed the RSVP.
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "RSVP not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Prediction save error:", error);
    return NextResponse.json({ error: "Failed to save predictions" }, { status: 500 });
  }
}
