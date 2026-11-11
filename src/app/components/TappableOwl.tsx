"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PartyOwl, Snowflake } from "./decor";
import { getMessages, type Lang } from "@/lib/i18n";

// How long the speech bubble and snow puff stay after a tap.
const HOOT_MS = 1800;

// Where each snowflake flies to from the owl's middle, and how far it spins.
// Written out rather than random so server and browser render the same.
const PUFF = [
  { dx: "-70px", dy: "-50px", spin: "160deg", tone: "text-sky", size: "w-5" },
  { dx: "-82px", dy: "8px", spin: "-120deg", tone: "text-periwinkle", size: "w-4" },
  { dx: "-46px", dy: "56px", spin: "200deg", tone: "text-glacier", size: "w-4" },
  { dx: "66px", dy: "-58px", spin: "-180deg", tone: "text-blush", size: "w-5" },
  { dx: "84px", dy: "0px", spin: "140deg", tone: "text-sky", size: "w-4" },
  { dx: "52px", dy: "54px", spin: "-150deg", tone: "text-periwinkle", size: "w-4" },
  { dx: "0px", dy: "-84px", spin: "120deg", tone: "text-glacier", size: "w-4" },
];

let audio: AudioContext | null = null;

// A soft two-note "hoo-hoo", made on the spot so there's no sound file to
// load. Only ever plays in answer to a tap, and quietly. Phones on silent
// stay silent.
function hoot() {
  try {
    if (typeof AudioContext === "undefined") return;
    audio ??= new AudioContext();
    const ctx = audio;
    void ctx.resume();
    const now = ctx.currentTime;
    for (const [start, length] of [
      [0, 0.28],
      [0.38, 0.46],
    ]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(430, now + start);
      osc.frequency.exponentialRampToValueAtTime(350, now + start + length);
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(0.1, now + start + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + length);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + length + 0.05);
    }
  } catch {
    // No sound is fine.
  }
}

// The owl in the header. Tapping it makes it hop, flap, blink, puff out a
// little snow and say something - a different line each tap. Everything
// restarts on every tap, so it can be tapped again straight away. With
// "reduce motion" on, only the speech bubble appears (see globals.css).
export default function TappableOwl({ lang, className = "" }: { lang: Lang; className?: string }) {
  const t = getMessages(lang).hero;
  const [taps, setTaps] = useState(0);
  const [hooting, setHooting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function handleTap() {
    setTaps((n) => n + 1);
    setHooting(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setHooting(false), HOOT_MS);
    hoot();
  }

  const line = t.hoots[(taps - 1 + t.hoots.length) % t.hoots.length];

  return (
    <button
      type="button"
      onClick={handleTap}
      aria-label={t.owlLabel}
      title={t.owlLabel}
      className={`relative cursor-pointer touch-manipulation rounded-full transition-transform hover:scale-105 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-sky ${className}`}
    >
      {/* Keyed by the tap count so each tap replays the animations */}
      <span key={taps} className={`block ${taps > 0 ? "owl-hop owl-tapped" : ""}`}>
        <PartyOwl animated className="w-full origin-bottom animate-wobble" />
      </span>

      {hooting && (
        <>
          <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[45%]">
            {PUFF.map((flake, i) => (
              <span
                key={`${taps}-${i}`}
                className={`owl-puff absolute left-0 top-0 ${flake.tone}`}
                style={{ "--dx": flake.dx, "--dy": flake.dy, "--spin": flake.spin } as CSSProperties}
              >
                <Snowflake className={flake.size} />
              </span>
            ))}
          </span>

          {/* Anchored to the owl's right edge and growing leftwards, so it
              stays on screen even where the owl sits near the edge. */}
          <span
            key={`bubble-${taps}`}
            aria-hidden="true"
            className="owl-bubble pointer-events-none absolute bottom-[92%] right-0 z-20 w-max max-w-[11rem] rounded-2xl border-[2.5px] border-ink bg-white px-3 py-1.5 text-left font-display text-sm font-semibold leading-snug text-ink shadow-[3px_3px_0_0_var(--color-ink)] md:max-w-[14rem] md:text-base"
          >
            {line}
            <span
              aria-hidden="true"
              className="absolute -bottom-[7px] right-6 h-3 w-3 rotate-45 border-b-[2.5px] border-r-[2.5px] border-ink bg-white"
            />
          </span>
        </>
      )}

      {/* What the owl says, for screen readers. Always present so the change
          is announced; the bubble above is the visual copy. */}
      <span role="status" className="sr-only">
        {hooting ? line : ""}
      </span>
    </button>
  );
}
