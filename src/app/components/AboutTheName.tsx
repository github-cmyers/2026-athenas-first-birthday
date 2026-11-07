import { PartyOwl, SectionHeading } from "./decor";

interface AboutTheNameProps {
  name: string;
  origin: string;
  meaning: string;
  reason: string;
}

export default function AboutTheName({ name, origin, meaning, reason }: AboutTheNameProps) {
  return (
    <section className="mx-auto mb-20 max-w-3xl px-4">
      <SectionHeading eyebrow="Her name" title={`Why ${name}?`} chip="periwinkle" squiggle="glacier" />

      <div className="sticker bg-lilac p-6 md:flex md:items-center md:gap-10 md:p-10">
        <div className="text-center md:w-1/3 md:shrink-0">
          <PartyOwl hat={false} className="mx-auto w-28 md:w-36" />
          <div className="mt-3 font-display text-5xl font-bold text-ink">{name}</div>
          <span className="chip mt-3 bg-white text-xs">{origin} origin</span>
          <p className="mt-4 text-sm text-ink/70">
            The owl, symbol of Athena, represents wisdom and knowledge
          </p>
        </div>

        <dl className="mt-8 space-y-5 text-ink/85 md:mt-0">
          <div>
            <dt className="font-display text-xl font-semibold text-ink">Meaning</dt>
            <dd className="mt-1 leading-relaxed">{meaning}</dd>
          </div>
          <div>
            <dt className="font-display text-xl font-semibold text-ink">Why we chose it</dt>
            <dd className="mt-1 leading-relaxed">{reason}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
