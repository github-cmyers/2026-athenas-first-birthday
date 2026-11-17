"use client";

import { useEffect, useState } from "react";
import { SectionHeading } from "./decor";
import { formatEventTimeRange, PARTY_DURATION_HOURS, PARTY_SCHEDULE } from "@/lib/event";
import { getMessages, type Lang } from "@/lib/i18n";

// The day's plan, shown on party day, with whatever is happening right now
// highlighted. The server passes its clock so the first render matches; the
// highlight then moves on by itself while the page stays open.
export default function PartySchedule({
  lang,
  startIso,
  nowIso,
}: {
  lang: Lang;
  startIso: string;
  nowIso: string;
}) {
  const t = getMessages(lang).schedule;
  const [now, setNow] = useState(() => new Date(nowIso).getTime());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const start = new Date(startIso).getTime();
  const end = start + PARTY_DURATION_HOURS * 60 * 60 * 1000;
  // Each item runs until the next one starts; the last until the party ends.
  const items = PARTY_SCHEDULE.map((item, i) => ({
    ...item[lang],
    at: start + item.minutes * 60 * 1000,
    until: i + 1 < PARTY_SCHEDULE.length ? start + PARTY_SCHEDULE[i + 1].minutes * 60 * 1000 : end,
  }));

  // The latest item that has started, as long as the party is on.
  let current = -1;
  if (now >= start && now < end) {
    items.forEach((item, i) => {
      if (now >= item.at) current = i;
    });
  }

  return (
    <section id="schedule" className="mx-auto mb-20 max-w-3xl scroll-mt-6 px-4">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} chip="berry" squiggle="glacier" />

      <ol className="sticker space-y-3 p-5 md:p-8">
        {items.map((item, i) => {
          const isCurrent = i === current;
          const isPast = current !== -1 && i < current;
          return (
            <li
              key={item.at}
              aria-current={isCurrent ? "step" : undefined}
              className={`flex flex-col gap-1 rounded-2xl border-[2.5px] p-4 transition-colors sm:flex-row sm:gap-4 ${
                isCurrent
                  ? "border-ink bg-glacier/35 shadow-[3px_3px_0_0_var(--color-ink)]"
                  : "border-ink/15"
              } ${isPast ? "opacity-55" : ""}`}
            >
              {/* On phones the time sits above the title, so a range like
                  "3:00 – 8:00 PM" never squeezes it. */}
              <time
                dateTime={new Date(item.at).toISOString()}
                className="shrink-0 whitespace-nowrap pt-0.5 font-display text-lg font-semibold tabular-nums text-ink sm:w-40"
              >
                {formatEventTimeRange(new Date(item.at), new Date(item.until), lang)}
              </time>
              <div>
                <div className="flex flex-wrap items-center gap-2 font-display text-xl font-semibold text-ink">
                  {item.title}
                  {isCurrent && <span className="chip bg-blush text-xs">{t.now}</span>}
                </div>
                {item.detail && <p className="mt-0.5 text-ink/75">{item.detail}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
