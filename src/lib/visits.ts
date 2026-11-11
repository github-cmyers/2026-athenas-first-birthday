import { query } from "./db";
import { EVENT_TIME_ZONE } from "./event";
import type { Lang } from "./i18n";

// How often the invitation is opened, for the admin page. Only daily counts
// are kept - per language and per kind of device - with nothing about who
// visited: no IP addresses, names or identifiers.
//
// "Opens" counts each visit once (a browser tab's session), however many
// times the page is refreshed or the language switched. "New devices" counts
// the first visit from each browser, remembered by a flag kept in that
// browser only - so it's roughly the number of people, give or take someone
// using both a phone and a computer.
export const VISITS_TABLE = "Visits_First_Birthday";

export type Device = "phone" | "computer";

export interface VisitRow {
  day: string; // YYYY-MM-DD, Eastern time
  lang: Lang;
  device: Device;
  opens: number;
  newdevices: number;
}

// Created once per server process, like the RSVP table.
let tableReady: Promise<void> | null = null;

function ensureVisitsTable(): Promise<void> {
  tableReady ??= query(`
    CREATE TABLE IF NOT EXISTS ${VISITS_TABLE} (
      Day DATE NOT NULL,
      Lang VARCHAR(2) NOT NULL,
      Device VARCHAR(10) NOT NULL,
      Opens INT NOT NULL DEFAULT 0,
      NewDevices INT NOT NULL DEFAULT 0,
      PRIMARY KEY (Day, Lang, Device)
    )
  `).then(
    () => undefined,
    (error) => {
      tableReady = null;
      throw error;
    }
  );
  return tableReady;
}

// Phones and tablets count as "phone". iPads that ask for the desktop site
// (the default) look like a Mac and count as "computer".
export function deviceFromUserAgent(userAgent: string): Device {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent) ? "phone" : "computer";
}

export async function recordVisit(lang: Lang, device: Device, newDevice: boolean): Promise<void> {
  await ensureVisitsTable();
  await query(
    `INSERT INTO ${VISITS_TABLE} (Day, Lang, Device, Opens, NewDevices)
     VALUES ((NOW() AT TIME ZONE $1)::date, $2, $3, 1, $4)
     ON CONFLICT (Day, Lang, Device) DO UPDATE
       SET Opens = ${VISITS_TABLE}.Opens + 1,
           NewDevices = ${VISITS_TABLE}.NewDevices + EXCLUDED.NewDevices`,
    [EVENT_TIME_ZONE, lang, device, newDevice ? 1 : 0]
  );
}

export async function loadVisits(): Promise<VisitRow[]> {
  await ensureVisitsTable();
  const result = await query<VisitRow>(
    `SELECT to_char(Day, 'YYYY-MM-DD') AS day, Lang AS lang, Device AS device,
            Opens AS opens, NewDevices AS newdevices
       FROM ${VISITS_TABLE}
      ORDER BY Day`
  );
  return result.rows;
}
