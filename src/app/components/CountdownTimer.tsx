"use client";

import { useState, useEffect } from "react";
import { SnowCap } from "./decor";
import { getMessages, type Lang } from "@/lib/i18n";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  lang: Lang;
  targetDate: Date;
}

// One snow-capped block per unit, each its own colour and resting tilt.
const BLOCKS = [
  { unit: "days", style: "bg-blush -rotate-3" },
  { unit: "hours", style: "bg-sky rotate-2" },
  { unit: "minutes", style: "bg-glacier -rotate-2" },
  { unit: "seconds", style: "bg-periwinkle rotate-3" },
] as const;

function Blocks({ lang, values }: { lang: Lang; values: (number | null)[] }) {
  const t = getMessages(lang).countdown;
  return (
    <div className="mx-auto grid max-w-xl grid-cols-4 gap-3 pt-5 md:gap-6 md:pt-6">
      {BLOCKS.map((block, i) => (
        <div
          key={block.unit}
          className={`relative flex aspect-square flex-col items-center justify-center rounded-2xl border-[3px] border-ink text-ink shadow-[5px_5px_0_0_var(--color-snow)] ${block.style}`}
        >
          {/* The snow sits on top of the block, its flat base resting on the
              block's top border, like the snow on the cards. Overlapping the
              block instead covered its border and left white notches at the
              cap's ends on small screens. `bottom` is measured from inside
              the border, hence the extra 3px. */}
          <SnowCap className="absolute bottom-[calc(100%+3px)] left-2.5 right-2.5 h-4 md:left-3 md:right-3 md:h-5" />
          <div className="font-display text-3xl font-bold tabular-nums md:text-6xl">
            {values[i] === null ? "--" : String(values[i]).padStart(2, "0")}
          </div>
          <div className="mt-0.5 text-[0.65rem] font-bold uppercase tracking-wider md:text-sm">
            {t[block.unit]}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CountdownTimer({ lang, targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    function calculateTimeLeft(): TimeLeft | null {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference <= 0) {
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!hasMounted) {
    return <Blocks lang={lang} values={[null, null, null, null]} />;
  }

  if (!timeLeft) {
    return (
      <div className="text-center font-display text-3xl font-semibold text-snow">
        {getMessages(lang).countdown.started}
      </div>
    );
  }

  return (
    <Blocks
      lang={lang}
      values={[timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds]}
    />
  );
}
