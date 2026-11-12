import { PartyOwl, SectionHeading } from "./decor";
import { getMessages, type Lang } from "@/lib/i18n";

// Takes the place of the invitation once the party is over.
export default function ThankYou({ lang }: { lang: Lang }) {
  const t = getMessages(lang).thankYou;

  return (
    <section className="mx-auto mb-20 max-w-3xl px-4">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} chip="blush" squiggle="sky" />

      <div className="sticker p-6 text-lg leading-relaxed text-ink/85 md:flex md:items-center md:gap-8 md:p-10">
        <PartyOwl className="mx-auto mb-6 w-28 shrink-0 md:mb-0 md:w-36" />
        <div className="space-y-4">
          <p>{t.p1}</p>
          <p>{t.p2}</p>
          <p className="font-display text-xl font-semibold text-ink">{t.signoff} 💙</p>
        </div>
      </div>
    </section>
  );
}
