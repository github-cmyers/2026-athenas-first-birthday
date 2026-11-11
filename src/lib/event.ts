import type { Lang } from "./i18n";

// Single source of truth for when the party happens: Saturday, December 19th.
//
// TODO: confirm the start time - 4:00 PM is still a placeholder.
//
// The offset is explicit on purpose. A bare "2026-12-19T16:00:00" is parsed in
// whatever timezone the process happens to run in, so the same code produced
// 4:00 PM on a developer machine in Eastern and noon Eastern inside the
// production container, which runs UTC. -05:00 is EST, in effect on Dec 19;
// use -04:00 for a date between mid-March and early November (EDT).
export const partyDate = new Date("2026-12-19T16:00:00-05:00");

export const PARTY_DURATION_HOURS = 3;

// RSVPs close on their own when the party starts.
export const RSVP_CLOSES_AT = partyDate;

// Manual switch on top of the deadline: false closes RSVPs early. The form
// component and the RSVP API are left intact so flipping this back is all it
// takes to reopen (before the deadline).
export const RSVP_OPEN = true;

// Whether guests can submit an RSVP right now. Both the page (to choose form
// or closed notice) and the API (to refuse late submissions from a page that
// was left open past the deadline) ask this, so they can never disagree.
export function isRsvpOpen(now: Date = new Date()): boolean {
  return RSVP_OPEN && now < RSVP_CLOSES_AT;
}

// The most people one RSVP can count, the guest included. RSVPs cover the
// guest's immediate family only - anyone else goes through the host first - so
// this is deliberately modest. Shared by the form and the API so the dropdown
// can never offer a number the server would reject.
export const MAX_FAMILY_MEMBERS = 8;

// Who guests contact with questions, and before bringing anyone outside their
// immediate family. Shared by the contact section and the RSVP form so the
// name and number they show can never disagree.
export const HOST = {
  firstName: "Rama",
  fullName: "Rama Myers",
  phone: "401-499-8727",
};

// Where the party is. The coordinates only feed the weather forecast, so the
// town's are close enough - a forecast grid cell is several miles across.
// TODO: confirm the venue - this is still the naming ceremony's. If it
// changes, update the coordinates to the new town too.
export const VENUE = {
  address: "Jacky's Galaxie and Sushi Bar, 1488 Mineral Spring Ave, North Providence, RI 02904",
  latitude: 41.85, // North Providence, RI
  longitude: -71.47,
};

// e.g. "tel:4014998727"
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}

// Guests are told the time where the party is, not the time where they are.
// Pinning the zone also keeps server and client rendering identical, which
// would otherwise be a hydration mismatch.
export const EVENT_TIME_ZONE = "America/New_York";

function ordinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

// e.g. "October 10th, 2026", or "10 octobre 2026" in French
export function formatEventDate(date: Date, lang: Lang = "en"): string {
  if (lang === "fr") {
    return new Intl.DateTimeFormat("fr-FR", {
      timeZone: EVENT_TIME_ZONE,
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIME_ZONE,
    month: "long",
    day: "numeric",
    year: "numeric",
  }).formatToParts(date);

  const part = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";
  const day = Number(part("day"));

  return `${part("month")} ${day}${ordinalSuffix(day)}, ${part("year")}`;
}

// e.g. "4:00 PM", or "16:00" in French
export function formatEventTime(date: Date, lang: Lang = "en"): string {
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
    timeZone: EVENT_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: lang !== "fr",
  }).format(date);
}

// The calendar day a moment falls on where the party is, e.g. "2026-12-19".
export function eventDay(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// The page changes shape around the party:
// - "upcoming": the invitation, RSVP form and countdown.
// - "party-day": from midnight on the day (Eastern) until the party ends,
//   with the day's schedule up top. RSVPs still close at the start time.
// - "after": once the party is over, a thank-you replaces the invitation.
export type PartyPhase = "upcoming" | "party-day" | "after";

export const PARTY_PHASES: PartyPhase[] = ["upcoming", "party-day", "after"];

export function isPartyPhase(value: unknown): value is PartyPhase {
  return PARTY_PHASES.includes(value as PartyPhase);
}

export const PARTY_END = new Date(partyDate.getTime() + PARTY_DURATION_HOURS * 60 * 60 * 1000);

export function partyPhase(now: Date = new Date()): PartyPhase {
  if (now >= PARTY_END) return "after";
  if (eventDay(now) === eventDay(partyDate)) return "party-day";
  return "upcoming";
}

// The plan for the day, shown on the page on party day. Times are minutes
// after the start, so the schedule moves with partyDate if the start time
// changes.
//
// TODO: this is a draft - replace it with the real plan.
export interface ScheduleItem {
  minutes: number;
  en: { title: string; detail?: string };
  fr: { title: string; detail?: string };
}

export const PARTY_SCHEDULE: ScheduleItem[] = [
  {
    minutes: 0,
    en: { title: "Arrivals & hellos", detail: "Find a seat and say hi to the birthday girl" },
    fr: { title: "Arrivée des invités", detail: "Installez-vous et venez dire bonjour à la reine du jour" },
  },
  {
    minutes: 30,
    en: { title: "Food & drinks" },
    fr: { title: "Repas et boissons" },
  },
  {
    minutes: 90,
    en: { title: "Happy birthday & cake", detail: "Sing along as Athena meets her first birthday cake" },
    fr: { title: "Joyeux anniversaire et gâteau", detail: "Chantons ensemble pendant qu'Athena découvre son premier gâteau" },
  },
  {
    minutes: 120,
    en: { title: "Photos with Athena" },
    fr: { title: "Photos avec Athena" },
  },
  {
    minutes: 165,
    en: { title: "Goodbyes & hugs" },
    fr: { title: "Au revoir et câlins" },
  },
];
