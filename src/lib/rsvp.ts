import { query } from "./db";
import { MAX_FAMILY_MEMBERS } from "./event";
import type { PredictionAnswers } from "./predictions";

// The birthday gets its own table rather than reusing the naming ceremony's.
// The site may be pointed at the same database, and sharing a table would
// count every ceremony reply toward the birthday headcount.
//
// FamilyMembers is everyone the RSVP covers, the guest included, so a guest
// coming alone is 1. Declines store 0. This replaces the ceremony's PlusOne,
// which counted only the people a guest brought and invited open-ended
// plus-ones.
export const RSVP_TABLE = "RSVP_First_Birthday";

// A row as Postgres returns it: unquoted identifiers come back lower-cased.
// Shared with the admin page as a type-only import, so no server code ships
// to the browser.
export interface RsvpRow {
  id: number;
  name: string;
  familymembers: number;
  phone: string;
  email: string;
  attending: boolean;
  createdat: string;
  // The guest's picks for "Predictions for Athena", or null if they skipped
  // them (or replied before predictions existed).
  predictions: PredictionAnswers | null;
}

// What the admin API returns. Deliberately not `*`: PredictionToken is the
// guest's one-time key for attaching predictions and is never sent back out.
export const RSVP_COLUMNS =
  "Id, Name, FamilyMembers, Phone, Email, Attending, CreatedAt, Predictions";

// Both the RSVP routes and the count route need this table, so the definition
// lives in one place rather than being copy-pasted into each handler.
//
// Predictions and PredictionToken were added after the first RSVPs came in,
// so they are added to an existing table too. The work is done once per
// server process (ALTER TABLE takes a lock even when there is nothing to add);
// a failure clears the cached attempt so the next request tries again.
let tableReady: Promise<void> | null = null;

export function ensureRsvpTable(): Promise<void> {
  tableReady ??= createRsvpTable().catch((error) => {
    tableReady = null;
    throw error;
  });
  return tableReady;
}

async function createRsvpTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS ${RSVP_TABLE} (
      Id SERIAL PRIMARY KEY,
      Name VARCHAR(255) NOT NULL,
      FamilyMembers INT NOT NULL DEFAULT 0,
      Phone VARCHAR(50) NOT NULL,
      Email VARCHAR(255) NOT NULL,
      Attending BOOLEAN NOT NULL DEFAULT TRUE,
      CreatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await query(`
    ALTER TABLE ${RSVP_TABLE}
      ADD COLUMN IF NOT EXISTS Predictions JSONB,
      ADD COLUMN IF NOT EXISTS PredictionToken UUID
  `);
}

// Every guest's predictions, for the results shown on party day.
export async function loadAllPredictions(): Promise<PredictionAnswers[]> {
  await ensureRsvpTable();
  const result = await query<{ predictions: PredictionAnswers }>(
    `SELECT Predictions FROM ${RSVP_TABLE} WHERE Predictions IS NOT NULL`
  );
  return result.rows.map((row) => row.predictions);
}

export interface RsvpInput {
  name: string;
  phone: string;
  email: string;
  attending: boolean;
  familyMembers: number;
}

type ParseResult = { ok: true; value: RsvpInput } | { ok: false; error: string };

// Field limits match the column sizes, so a long value is rejected with a
// clear message instead of failing as a database error.
const LIMITS = { name: 255, phone: 50, email: 255 } as const;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

// Validates an RSVP coming from either the public form or the admin editor.
// Both go through the same rules, so an edit can never store something a
// guest could not have submitted.
export function parseRsvpInput(body: unknown): ParseResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request" };
  }
  const data = body as Record<string, unknown>;

  const name = text(data.name);
  const phone = text(data.phone);
  const email = text(data.email);

  if (typeof data.attending !== "boolean") {
    return { ok: false, error: "An attending response is required" };
  }
  const attending = data.attending;

  // Someone declining only needs to give their name; the form doesn't ask
  // for their phone or email. Guests who are coming give all three, so the
  // hosts can reach them. Declines store empty strings.
  if (!name) {
    return { ok: false, error: "Please enter your name" };
  }
  if (attending && (!phone || !email)) {
    return { ok: false, error: "Name, phone, and email are required" };
  }
  const fields = { name, phone, email };
  for (const field of Object.keys(LIMITS) as (keyof typeof LIMITS)[]) {
    if (fields[field].length > LIMITS[field]) {
      return { ok: false, error: `The ${field} is too long` };
    }
  }
  // Checked whenever there is one - a host may add an email to a decline.
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address" };
  }

  // Someone who is not coming brings no one, whatever was sent. Anyone who
  // is coming counts at least themselves, and is capped at the same limit
  // the form offers - a request is not trusted to have come from the form.
  const familyMembers = attending ? Number(data.familyMembers) : 0;
  if (
    attending &&
    (!Number.isInteger(familyMembers) ||
      familyMembers < 1 ||
      familyMembers > MAX_FAMILY_MEMBERS)
  ) {
    return {
      ok: false,
      error: `Number of attending family members must be between 1 and ${MAX_FAMILY_MEMBERS}`,
    };
  }

  return { ok: true, value: { name, phone, email, attending, familyMembers } };
}

// Route params arrive as strings; only positive integers are real ids.
export function parseRsvpId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}
