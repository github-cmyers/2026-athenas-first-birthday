import { HOST, telHref } from "@/lib/event";

// A note taped to the page, for the one thing every guest must read. Nothing
// renders one at the moment; it is kept ready for when a note is needed.
//
// To show a note, render it straight after a section's card, e.g. at the end
// of AboutTheParty:
//
//   <StickyNote title="📣 Parking">Please use the lot behind the venue.</StickyNote>
//
// or bring back the original guest note with <GuestNote />.
export default function StickyNote({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto -mt-3 max-w-md rotate-[1.5deg] rounded-md border-[3px] border-ink bg-blush p-5 pt-6 text-ink shadow-[5px_5px_0_0_var(--color-ink)] md:-mt-5 md:ml-auto md:mr-6">
      <span
        aria-hidden="true"
        className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-3 border border-ink/20 bg-white/70"
      />
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <div className="mt-2 leading-relaxed">{children}</div>
    </div>
  );
}

// The note asking guests to check with the host before bringing anyone
// outside their immediate family. Removed from the page for now.
export function GuestNote() {
  return (
    <StickyNote title="📣 A note about guests">
      <p>
        When you RSVP, please count only the members of your immediate family
        who will be attending. If you would like to bring anyone outside your
        immediate family, please reach out to {HOST.firstName} (
        <a
          href={telHref(HOST.phone)}
          className="font-semibold underline decoration-2 underline-offset-2"
        >
          {HOST.phone}
        </a>
        ) beforehand.
      </p>
    </StickyNote>
  );
}
