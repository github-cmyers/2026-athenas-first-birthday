import { Balloon, Bunting, PartyOwl, Snowfall } from "./decor";
import { formatEventDate, formatEventTime, partyDate } from "@/lib/event";

// Each letter of the giant "ONE!" gets its own colour and resting tilt; the
// bob animation sits on an inner span so it doesn't fight the tilt.
const LETTERS = [
  { char: "O", color: "text-blush", tilt: "-rotate-6", delay: "0s" },
  { char: "N", color: "text-sky", tilt: "rotate-3", delay: "-0.6s" },
  { char: "E", color: "text-glacier", tilt: "-rotate-3", delay: "-1.2s" },
  { char: "!", color: "text-periwinkle", tilt: "rotate-6", delay: "-1.8s" },
];

export default function Hero() {
  const date = formatEventDate(partyDate);
  const time = formatEventTime(partyDate);

  return (
    <header className="relative overflow-hidden pb-20">
      {/* Two swags of bunting on wide screens, one on phones */}
      <div className="relative z-10 flex">
        <Bunting flags={9} className="flex-1" />
        <Bunting flags={9} offset={3} className="hidden flex-1 md:block" />
      </div>

      <Snowfall count={30} />

      {/* Balloons drifting at the edges */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Balloon color="blush" className="absolute left-[3%] top-28 w-12 animate-float md:w-20" />
        <Balloon color="glacier" className="absolute left-[11%] top-72 hidden w-16 animate-float md:block" style={{ animationDelay: "-2s" }} />
        <Balloon color="sky" className="absolute right-[4%] top-32 w-12 animate-float md:w-20" style={{ animationDelay: "-3.5s" }} />
        <Balloon color="periwinkle" className="absolute right-[12%] top-80 hidden w-14 animate-float md:block" style={{ animationDelay: "-1s" }} />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <span className="chip -rotate-3 bg-ice text-base">You&apos;re invited! ❄️</span>

        <p className="mt-6 font-display text-3xl font-semibold text-ink md:text-5xl">
          Look whooo&apos;s turning
        </p>

        <div className="mt-2 flex items-center justify-center gap-3 md:gap-8">
          <div aria-hidden="true" className="flex gap-1 text-[5.25rem] md:gap-2 md:text-[10rem]">
            {LETTERS.map((letter) => (
              <span key={letter.char} className={`inline-block ${letter.tilt}`}>
                <span
                  className={`giant-letter animate-bob ${letter.color}`}
                  style={{ animationDelay: letter.delay }}
                >
                  {letter.char}
                </span>
              </span>
            ))}
          </div>
          <PartyOwl className="w-24 shrink-0 origin-bottom animate-wobble md:w-44" />
        </div>

        <h1 className="mt-6 font-display text-3xl font-bold text-ink md:text-5xl">
          Athena&apos;s First Birthday
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-ink/80 md:text-xl">
          Join us for a Winter ONEderland celebration as our baby girl
          turns one!
        </p>

        {/* Date and time stack on phones; the separator only makes sense
            when they sit side by side. */}
        <p className="mt-6 inline-flex flex-col items-center gap-0.5 rounded-2xl border-[3px] border-ink bg-white px-5 py-2 font-display text-lg font-medium text-ink shadow-[4px_4px_0_0_var(--color-ink)] sm:flex-row sm:gap-3">
          <span>📅 {date}</span>
          <span aria-hidden="true" className="hidden text-sky sm:inline">✦</span>
          <span>⏰ {time}</span>
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a href="#rsvp" className="btn-chunky bg-blush text-lg">
            RSVP now 💌
          </a>
          <a href="#details" className="btn-chunky bg-white text-lg">
            Party details
          </a>
        </div>
      </div>
    </header>
  );
}
