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

// e.g. "October 10th, 2026"
export function formatEventDate(date: Date): string {
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

// e.g. "4:00 PM"
export function formatEventTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}
