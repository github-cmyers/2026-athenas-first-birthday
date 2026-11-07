"use client";

import { useState, useEffect } from "react";
import { SnowCap } from "./decor";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate: Date;
}

// One snow-capped block per unit, each its own colour and resting tilt.
const BLOCKS = [
  { label: "Days", style: "bg-blush -rotate-3" },
  { label: "Hours", style: "bg-sky rotate-2" },
  { label: "Minutes", style: "bg-glacier -rotate-2" },
  { label: "Seconds", style: "bg-periwinkle rotate-3" },
] as const;

function Blocks({ values }: { values: (number | null)[] }) {
  return (
    <div className="mx-auto grid max-w-xl grid-cols-4 gap-3 pt-2 md:gap-6">
      {BLOCKS.map((block, i) => (
        <div
          key={block.label}
          className={`relative flex aspect-square flex-col items-center justify-center rounded-2xl border-[3px] border-ink text-ink shadow-[5px_5px_0_0_var(--color-snow)] ${block.style}`}
        >
          {/* Offsets put the cap's outline on the block's top border line:
              the outline sits 14/22 of the way down the cap. */}
          <SnowCap className="absolute -top-3.5 left-3 right-3 h-5 md:top-[-17px] md:h-6" />
          <div className="font-display text-3xl font-bold tabular-nums md:text-6xl">
            {values[i] === null ? "--" : String(values[i]).padStart(2, "0")}
          </div>
          <div className="mt-0.5 text-[0.65rem] font-bold uppercase tracking-wider md:text-sm">
            {block.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
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
    return <Blocks values={[null, null, null, null]} />;
  }

  if (!timeLeft) {
    return (
      <div className="text-center font-display text-3xl font-semibold text-snow">
        The party has begun! 🎉
      </div>
    );
  }

  return (
    <Blocks
      values={[timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds]}
    />
  );
}
