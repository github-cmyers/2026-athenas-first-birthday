import { SectionHeading } from "./decor";

// A note for guests can be pinned under this card with <StickyNote> (see
// StickyNote.tsx); the original guest-count note is kept there as <GuestNote>.
export default function AboutTheParty() {
  return (
    <section className="mx-auto mb-20 max-w-3xl px-4">
      <SectionHeading eyebrow="Hooray!" title="Athena is turning one!" chip="glacier" squiggle="periwinkle" />

      <div className="sticker space-y-4 p-6 text-lg leading-relaxed text-ink/85 md:p-10">
        <p>
          It&apos;s hard to believe a whole year has passed since we welcomed
          Athena into the world. Many of you celebrated with us at her naming
          ceremony, and we would love for you to join us again as we mark her
          very first birthday.
        </p>
        <p>
          Come share cake, laughter, and plenty of smiles as we celebrate our
          little girl and all of the family and friends who have loved and
          supported her through her first year.
        </p>
        <p className="font-semibold text-ink">
          🎁 Please do not feel obligated to bring a gift — your presence and
          love are the most cherished gifts as we celebrate Athena&apos;s first
          year.
        </p>
      </div>
    </section>
  );
}
