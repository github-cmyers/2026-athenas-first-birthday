// Hand-drawn party decorations shared across the page. Everything here is
// plain SVG/markup with no state, so it renders on the server and costs no
// JavaScript. Colours come from the palette in globals.css via Tailwind's
// fill-*, stroke-*, bg-* and text-* utilities.
//
// Tailwind only emits classes it can see written out in full, so colour names
// are mapped to complete class strings below rather than interpolated.

import type { CSSProperties } from "react";

export type PartyColor = "coral" | "sunny" | "mint" | "grape" | "bubblegum" | "sky";

export const PARTY_COLORS: PartyColor[] = ["coral", "sunny", "mint", "grape", "bubblegum", "sky"];

const FILL: Record<PartyColor, string> = {
  coral: "fill-coral",
  sunny: "fill-sunny",
  mint: "fill-mint",
  grape: "fill-grape",
  bubblegum: "fill-bubblegum",
  sky: "fill-sky",
};

export const BG: Record<PartyColor | "white", string> = {
  coral: "bg-coral",
  sunny: "bg-sunny",
  mint: "bg-mint",
  grape: "bg-grape",
  bubblegum: "bg-bubblegum",
  sky: "bg-sky",
  white: "bg-white",
};

const TEXT: Record<PartyColor, string> = {
  coral: "text-coral",
  sunny: "text-sunny",
  mint: "text-mint",
  grape: "text-grape",
  bubblegum: "text-bubblegum",
  sky: "text-sky",
};

// A string of pennant flags sagging between two points. The flags are placed
// along the same quadratic curve the string is drawn with, and tilted to follow
// its slope, so they stay hung on the string at any width.
export function Bunting({
  flags = 9,
  offset = 0,
  className = "",
}: {
  flags?: number;
  offset?: number;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={`relative h-24 ${className}`}>
      <svg
        className="absolute inset-x-0 top-0 h-12 w-full overflow-visible"
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
      >
        <path
          d="M0 4 Q50 60 100 4"
          fill="none"
          className="stroke-ink"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {Array.from({ length: flags }, (_, i) => {
        const t = (i + 1) / (flags + 1);
        // y of the curve at t, in viewBox units, scaled to the 48px-tall svg.
        const top = (4 + 112 * t * (1 - t)) * 1.2;
        const tilt = 13 * (1 - 2 * t);
        const color = PARTY_COLORS[(i + offset) % PARTY_COLORS.length];
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${t * 100}%`,
              top: `${top - 3}px`,
              width: "clamp(20px, 5vw, 38px)",
              transform: `translateX(-50%) rotate(${tilt}deg)`,
              transformOrigin: "top center",
            }}
          >
            <svg
              viewBox="0 0 36 44"
              className="block w-full origin-top animate-sway"
              style={{ animationDelay: `${-i * 0.45}s` }}
            >
              <path
                d="M2 2 H34 L18 42 Z"
                className={`${FILL[color]} stroke-ink`}
                strokeWidth="3"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
}

export function Balloon({
  color,
  className = "",
  style,
}: {
  color: PartyColor;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 60 130" aria-hidden="true" className={className} style={style}>
      <path
        d="M30 71 C 24 86, 38 98, 30 128"
        fill="none"
        className="stroke-ink"
        strokeWidth="2"
      />
      <path
        d="M30 64 L24 72 L36 72 Z"
        className={`${FILL[color]} stroke-ink`}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <ellipse
        cx="30"
        cy="34"
        rx="26"
        ry="31"
        className={`${FILL[color]} stroke-ink`}
        strokeWidth="3"
      />
      <ellipse
        cx="20"
        cy="22"
        rx="5"
        ry="9"
        fill="#fff"
        opacity="0.6"
        transform="rotate(-25 20 22)"
      />
    </svg>
  );
}

// Athena's owl, dressed for a party. The hat comes off where the owl stands
// for her name rather than the birthday.
export function PartyOwl({
  hat = true,
  className = "",
}: {
  hat?: boolean;
  className?: string;
}) {
  return (
    <svg viewBox="-6 -14 212 252" aria-hidden="true" className={className}>
      {/* Ear tufts, tucked behind the body */}
      <path d="M46 96 L38 48 L80 76 Z" className="fill-grape stroke-ink" strokeWidth="5" strokeLinejoin="round" />
      <path d="M154 96 L162 48 L120 76 Z" className="fill-grape stroke-ink" strokeWidth="5" strokeLinejoin="round" />

      <ellipse cx="100" cy="146" rx="72" ry="78" className="fill-grape stroke-ink" strokeWidth="5" />

      {/* Belly with feather marks */}
      <ellipse cx="100" cy="180" rx="44" ry="38" className="fill-lilac" />
      <path
        d="M76 170 q6 8 12 0 M94 170 q6 8 12 0 M112 170 q6 8 12 0 M85 188 q6 8 12 0 M103 188 q6 8 12 0"
        fill="none"
        className="stroke-grape"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Wings */}
      <ellipse cx="36" cy="166" rx="15" ry="34" transform="rotate(14 36 166)" className="fill-[#8b6fe8] stroke-ink" strokeWidth="5" />
      <ellipse cx="164" cy="166" rx="15" ry="34" transform="rotate(-14 164 166)" className="fill-[#8b6fe8] stroke-ink" strokeWidth="5" />

      {/* Cheeks */}
      <circle cx="62" cy="160" r="7" className="fill-bubblegum" opacity="0.85" />
      <circle cx="138" cy="160" r="7" className="fill-bubblegum" opacity="0.85" />

      {/* Eyes */}
      <circle cx="70" cy="122" r="29" fill="#fff" className="stroke-ink" strokeWidth="5" />
      <circle cx="130" cy="122" r="29" fill="#fff" className="stroke-ink" strokeWidth="5" />
      <circle cx="74" cy="126" r="13" className="fill-ink" />
      <circle cx="126" cy="126" r="13" className="fill-ink" />
      <circle cx="79" cy="120" r="4.5" fill="#fff" />
      <circle cx="131" cy="120" r="4.5" fill="#fff" />

      <path d="M91 146 L109 146 L100 162 Z" className="fill-sunny stroke-ink" strokeWidth="4" strokeLinejoin="round" />

      {/* Feet */}
      <ellipse cx="80" cy="224" rx="13" ry="7" className="fill-sunny stroke-ink" strokeWidth="4" />
      <ellipse cx="120" cy="224" rx="13" ry="7" className="fill-sunny stroke-ink" strokeWidth="4" />

      {hat && (
        <g transform="rotate(14 106 72)">
          <path d="M80 74 L108 6 L134 74 Z" className="fill-coral stroke-ink" strokeWidth="5" strokeLinejoin="round" />
          <circle cx="100" cy="58" r="4.5" className="fill-sunny" />
          <circle cx="114" cy="38" r="4" className="fill-sunny" />
          <circle cx="118" cy="64" r="4.5" className="fill-sunny" />
          <circle cx="106" cy="24" r="3.5" className="fill-sunny" />
          <circle cx="108" cy="5" r="10" className="fill-sunny stroke-ink" strokeWidth="4" />
        </g>
      )}
    </svg>
  );
}

export function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 106 14" aria-hidden="true" className={className} fill="none">
      <path
        d="M3 9 Q13 1 23 9 T43 9 T63 9 T83 9 T103 9"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Scalloped edge for the full-width colour bands. The fill is currentColor, so
// a text-* class picks the band colour.
const WAVE_PATH = (() => {
  let d = "M0 40 L0 20 Q50 0 100 20";
  for (let x = 200; x <= 1200; x += 100) d += ` T${x} 20`;
  return `${d} L1200 40 Z`;
})();

export function Wave({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1200 40"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`-my-px block h-6 w-full md:h-10 ${flip ? "rotate-180" : ""} ${className}`}
    >
      <path d={WAVE_PATH} fill="currentColor" />
    </svg>
  );
}

// Scattered confetti pieces drifting in place. Positions are derived from the
// index rather than Math.random so server and client render the same markup.
export function Confetti({ count = 22, className = "" }: { count?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {Array.from({ length: count }, (_, i) => {
        const shape =
          i % 3 === 0
            ? "h-1.5 w-4 rounded-full"
            : i % 3 === 1
              ? "h-2.5 w-2.5 rounded-full"
              : "h-3 w-3 rounded-[3px]";
        return (
          <span
            key={i}
            className={`absolute animate-drift opacity-80 ${BG[PARTY_COLORS[i % PARTY_COLORS.length]]} ${shape}`}
            style={{
              left: `${(i * 37 + 11) % 100}%`,
              top: `${(i * 53 + 7) % 100}%`,
              animationDelay: `${-(i % 7) * 1.1}s`,
              animationDuration: `${6 + (i % 4)}s`,
            }}
          />
        );
      })}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  chip = "sunny",
  squiggle = "coral",
  light = false,
  className = "",
}: {
  eyebrow: string;
  title: string;
  chip?: PartyColor | "white";
  squiggle?: PartyColor;
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={`mb-8 text-center ${className}`}>
      <span className={`chip -rotate-2 ${BG[chip]}`}>{eyebrow}</span>
      <h2
        className={`mt-4 font-display text-4xl font-semibold md:text-5xl ${
          light ? "text-cream" : "text-ink"
        }`}
      >
        {title}
      </h2>
      <Squiggle className={`mx-auto mt-2 h-4 w-28 ${TEXT[squiggle]}`} />
    </div>
  );
}
