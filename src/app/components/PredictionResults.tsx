import AnimatedSection from "./AnimatedSection";
import { PREDICTION_ACCENTS, SectionHeading } from "./decor";
import { getMessages, type Lang } from "@/lib/i18n";
import { tallyPredictions, type PredictionAnswers } from "@/lib/predictions";
import { loadAllPredictions } from "@/lib/rsvp";

// Everyone's "Predictions for Athena", revealed on party day and kept up
// afterwards. Renders nothing until someone has made a prediction, or if the
// database can't be reached - the rest of the page never depends on it.
export default async function PredictionResults({ lang }: { lang: Lang }) {
  let all: PredictionAnswers[];
  try {
    all = await loadAllPredictions();
  } catch (error) {
    console.error("Prediction results error:", error);
    return null;
  }
  if (all.length === 0) return null;

  const t = getMessages(lang).predictions;
  const tally = tallyPredictions(all);

  return (
    <AnimatedSection animation="fade-up" delay={0}>
      <section id="predictions" className="mx-auto mb-20 max-w-5xl scroll-mt-6 px-4">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} chip="periwinkle" squiggle="blush" />
        <p className="mx-auto -mt-2 mb-10 max-w-xl text-center text-lg text-ink/75">
          {t.summary(tally.responses)}
        </p>

        <div className="grid gap-10 md:grid-cols-2 md:gap-8">
          {tally.questions.map(({ question, options, topVotes }, i) => {
            const accent = PREDICTION_ACCENTS[i % PREDICTION_ACCENTS.length];
            return (
              <article key={question.id} className="sticker p-5 md:p-6">
                <h3 className="mb-4 flex items-center gap-2.5 font-display text-xl font-semibold leading-snug text-ink">
                  <span
                    aria-hidden="true"
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[2.5px] border-ink text-base ${accent.badge}`}
                  >
                    {i + 1}
                  </span>
                  {question[lang]}
                </h3>

                <ol className="space-y-3">
                  {options.map(({ option, votes }) => {
                    const isTop = topVotes > 0 && votes === topVotes;
                    return (
                      <li key={option.id} className={votes === 0 ? "opacity-50" : undefined}>
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold text-ink">
                            <span aria-hidden="true">{option.icon}</span>
                            {option[lang]}
                            {isTop && (
                              <span className="chip bg-gold px-2 py-0 text-[0.65rem] shadow-[2px_2px_0_0_var(--color-ink)]">
                                {t.topPick}
                              </span>
                            )}
                          </span>
                          <span className="shrink-0 text-sm tabular-nums text-ink/70">{t.votes(votes)}</span>
                        </div>
                        {/* Out of everyone who made predictions, so a bar is
                            full only if every guest picked that answer. */}
                        <div aria-hidden="true" className="mt-1.5 h-3 overflow-hidden rounded-full border-2 border-ink/15 bg-snow">
                          <div
                            className={`h-full rounded-full ${accent.bar}`}
                            style={{ width: `${(votes / tally.responses) * 100}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </article>
            );
          })}
        </div>
      </section>
    </AnimatedSection>
  );
}
