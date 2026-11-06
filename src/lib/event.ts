// Single source of truth for when the party happens.
//
// TODO: set the real date and time of Athena's first birthday party. This is
// still the naming ceremony's date, carried over when the site was reused.
//
// The offset is explicit on purpose. A bare "2026-10-10T16:00:00" is parsed in
// whatever timezone the process happens to run in, so the same code produced
// 4:00 PM on a developer machine in Eastern and noon Eastern inside the
// production container, which runs UTC. Use -04:00 while EDT is in effect
// (mid-March to early November) and -05:00 for EST the rest of the year.
export const partyDate = new Date("2026-10-10T16:00:00-04:00");

export const PARTY_DURATION_HOURS = 3;

// Whether guests can still submit an RSVP. When false the home page shows a
// "closed" notice in place of the form; the form component and the RSVP API
// are left intact so flipping this back is all it takes to reopen.
export const RSVP_OPEN = true;

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
