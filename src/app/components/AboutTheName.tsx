import { PartyOwl, SectionHeading } from "./decor";
import { getMessages, type Lang } from "@/lib/i18n";

// The wording lives in i18n.ts so it can be shown in English or French.
export default function AboutTheName({ lang }: { lang: Lang }) {
  const t = getMessages(lang).name;

  return (
    <section className="mx-auto mb-20 max-w-3xl px-4">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} chip="periwinkle" squiggle="glacier" />

      <div className="sticker bg-lilac p-6 md:flex md:items-center md:gap-10 md:p-10">
        <div className="text-center md:w-1/3 md:shrink-0">
          <PartyOwl hat={false} className="mx-auto w-28 md:w-36" />
          <div className="mt-3 font-display text-5xl font-bold text-ink">Athena</div>
          <span className="chip mt-3 bg-white text-xs">{t.origin}</span>
          <p className="mt-4 text-sm text-ink/70">{t.owl}</p>
        </div>

        <dl className="mt-8 space-y-5 text-ink/85 md:mt-0">
          <div>
            <dt className="font-display text-xl font-semibold text-ink">{t.meaningLabel}</dt>
            <dd className="mt-1 leading-relaxed">{t.meaning}</dd>
          </div>
          <div>
            <dt className="font-display text-xl font-semibold text-ink">{t.reasonLabel}</dt>
            <dd className="mt-1 leading-relaxed">{t.reason}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
