import { SectionHeading } from "./decor";
import { getMessages, type Lang } from "@/lib/i18n";

// A note for guests can be pinned under this card with <StickyNote> (see
// StickyNote.tsx); the original guest-count note is kept there as <GuestNote>.
export default function AboutTheParty({ lang }: { lang: Lang }) {
  const t = getMessages(lang).about;

  return (
    <section className="mx-auto mb-20 max-w-3xl px-4">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} chip="glacier" squiggle="periwinkle" />

      <div className="sticker space-y-4 p-6 text-lg leading-relaxed text-ink/85 md:p-10">
        <p>{t.p1}</p>
        <p>{t.p2}</p>
      </div>
    </section>
  );
}
