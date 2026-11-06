import { query } from "./db";

// The birthday gets its own table rather than reusing the naming ceremony's.
// The site may be pointed at the same database, and sharing a table would
// count every ceremony reply toward the birthday headcount.
//
// FamilyMembers is everyone the RSVP covers, the guest included, so a guest
// coming alone is 1. Declines store 0. This replaces the ceremony's PlusOne,
// which counted only the people a guest brought and invited open-ended
// plus-ones.
export const RSVP_TABLE = "RSVP_First_Birthday";

// Both the RSVP routes and the count route need this table, so the definition
// lives in one place rather than being copy-pasted into each handler.
export async function ensureRsvpTable() {
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
}
