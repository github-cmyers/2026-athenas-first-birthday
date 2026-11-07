// Hand-drawn winter party decorations shared across the page. Everything here
// is plain SVG/markup with no state, so it renders on the server and costs no
// JavaScript. Colours come from the palette in globals.css via Tailwind's
// fill-*, stroke-*, bg-* and text-* utilities.
//
// Tailwind only emits classes it can see written out in full, so colour names
// are mapped to complete class strings below rather than interpolated.

import type { CSSProperties } from "react";

export type PartyColor = "blush" | "sky" | "glacier" | "periwinkle" | "berry" | "ice";

export const PARTY_COLORS: PartyColor[] = ["blush", "sky", "glacier", "periwinkle", "berry", "ice"];

const FILL: Record<PartyColor, string> = {
  blush: "fill-blush",
  sky: "fill-sky",
  glacier: "fill-glacier",
  periwinkle: "fill-periwinkle",
  berry: "fill-berry",
  ice: "fill-ice",
};

export const BG: Record<PartyColor | "white", string> = {
  blush: "bg-blush",
  sky: "bg-sky",
  glacier: "bg-glacier",
  periwinkle: "bg-periwinkle",
  berry: "bg-berry",
  ice: "bg-ice",
  white: "bg-white",
};

const TEXT: Record<PartyColor, string> = {
  blush: "text-blush",
  sky: "text-sky",
  glacier: "text-glacier",
  periwinkle: "text-periwinkle",
  berry: "text-berry",
  ice: "text-ice",
};

// A six-armed snowflake. Drawn in currentColor by default, so a text-* class
// colours it; `color` sets it directly where classes don't apply (the link
// preview image).
export function Snowflake({
  className = "",
  style,
  color = "currentColor",
}: {
  className?: string;
  style?: CSSProperties;
  color?: string;
}) {
  return (
    <svg viewBox="-12 -12 24 24" aria-hidden="true" className={className} style={style}>
      <g fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0-10V10M-8.7-5L8.7 5M-8.7 5L8.7-5" />
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <path key={angle} d="M-3-8.2L0-5.6L3-8.2" transform={`rotate(${angle})`} />
        ))}
      </g>
    </svg>
  );
}

// A string of pennant flags sagging between two points, each flag stamped
// with a little white snowflake. The flags are placed along the same quadratic
// curve the string is drawn with, and tilted to follow its slope, so they stay
// hung on the string at any width.
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
              <path
                d="M18 9V21M12.8 12L23.2 18M12.8 18L23.2 12"
                fill="none"
                stroke="#fff"
                strokeWidth="2.2"
                strokeLinecap="round"
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

// The owl's colours as plain hex values rather than Tailwind classes, because
// the same drawing is also rendered into the link preview image, where
// classes don't apply. These mirror the palette in globals.css; keep the two
// in step if the theme changes.
export const OWL_COLORS = {
  ink: "#1f2a52",
  body: "#b3b5f7", // periwinkle
  wing: "#9599ee",
  belly: "#ffffff",
  cheek: "#f9b4cf", // blush
  gold: "#f6c56b",
  scarf: "#ec6f9c", // berry
  scarfStripe: "#f9b4cf", // blush
  hat: "#74b9ee", // sky
  white: "#ffffff",
};

// Athena's owl, dressed for a winter party in a party hat and knitted scarf.
// Both come off where the owl stands for her name rather than the birthday.
// Width and height are passed straight to the <svg> for the preview image,
// which needs explicit pixel sizes; on the page, size it with className.
export function PartyOwl({
  hat = true,
  className = "",
  width,
  height,
}: {
  hat?: boolean;
  className?: string;
  width?: number;
  height?: number;
}) {
  const c = OWL_COLORS;
  const outline = { stroke: c.ink, strokeLinejoin: "round" as const };

  return (
    <svg viewBox="-6 -14 212 252" aria-hidden="true" className={className} width={width} height={height}>
      {/* Ear tufts, tucked behind the body */}
      <path d="M46 96 L38 48 L80 76 Z" fill={c.body} strokeWidth="5" {...outline} />
      <path d="M154 96 L162 48 L120 76 Z" fill={c.body} strokeWidth="5" {...outline} />

      <ellipse cx="100" cy="146" rx="72" ry="78" fill={c.body} strokeWidth="5" {...outline} />

      {/* Belly with feather marks, low enough to clear the scarf */}
      <ellipse cx="100" cy="180" rx="44" ry="38" fill={c.belly} />
      <path
        d="M76 194 q6 8 12 0 M94 194 q6 8 12 0 M112 194 q6 8 12 0 M85 206 q6 8 12 0 M103 206 q6 8 12 0"
        fill="none"
        stroke={c.body}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Wings */}
      <ellipse cx="36" cy="166" rx="15" ry="34" transform="rotate(14 36 166)" fill={c.wing} strokeWidth="5" {...outline} />
      <ellipse cx="164" cy="166" rx="15" ry="34" transform="rotate(-14 164 166)" fill={c.wing} strokeWidth="5" {...outline} />

      {/* Cheeks */}
      <circle cx="62" cy="160" r="7" fill={c.cheek} />
      <circle cx="138" cy="160" r="7" fill={c.cheek} />

      {/* Eyes */}
      <circle cx="70" cy="122" r="29" fill={c.white} stroke={c.ink} strokeWidth="5" />
      <circle cx="130" cy="122" r="29" fill={c.white} stroke={c.ink} strokeWidth="5" />
      <circle cx="74" cy="126" r="13" fill={c.ink} />
      <circle cx="126" cy="126" r="13" fill={c.ink} />
      <circle cx="79" cy="120" r="4.5" fill={c.white} />
      <circle cx="131" cy="120" r="4.5" fill={c.white} />

      {/* Beak, nestled between the eyes and drawn over their lower inner
          edges so it reads as part of the face rather than floating below. */}
      <path d="M89 133 Q100 128 111 133 L100 155 Z" fill={c.gold} strokeWidth="4" {...outline} />

      {/* Feet */}
      <ellipse cx="80" cy="224" rx="13" ry="7" fill={c.gold} stroke={c.ink} strokeWidth="4" />
      <ellipse cx="120" cy="224" rx="13" ry="7" fill={c.gold} stroke={c.ink} strokeWidth="4" />

      {/* A <g>, not a fragment: the preview-image renderer handles groups
          inside SVG more reliably. */}
      {hat && (
        <g>
          {/* Knitted scarf: a band around the body and a striped tail */}
          <path d="M34 166 Q100 186 166 166 L164 182 Q100 204 36 182 Z" fill={c.scarf} strokeWidth="4" {...outline} />
          <path
            d="M60 176V186M80 179V189M120 179V189M140 176V186"
            fill="none"
            stroke={c.scarfStripe}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path d="M120 184 L138 180 L150 210 L132 215 Z" fill={c.scarf} strokeWidth="4" {...outline} />
          <path d="M126 195 L141 191 M130 205 L145 201" fill="none" stroke={c.scarfStripe} strokeWidth="4" strokeLinecap="round" />
          <path d="M135 215 L134 222 M141 213 L141 220 M147 211 L148 218" fill="none" stroke={c.ink} strokeWidth="3" strokeLinecap="round" />

          {/* Party hat with a snowball pom-pom */}
          <g transform="rotate(14 106 72)">
            <path d="M80 74 L108 6 L134 74 Z" fill={c.hat} strokeWidth="5" {...outline} />
            <circle cx="100" cy="58" r="4.5" fill={c.white} />
            <circle cx="114" cy="38" r="4" fill={c.white} />
            <circle cx="118" cy="64" r="4.5" fill={c.white} />
            <circle cx="106" cy="24" r="3.5" fill={c.white} />
            <circle cx="108" cy="5" r="10" fill={c.white} stroke={c.ink} strokeWidth="4" />
          </g>
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

// Snowdrift edge for the full-width colour bands: a row of uneven rounded
// mounds. The fill is currentColor, so a text-* class picks the colour.
const DRIFT_PEAKS = [6, 0, 9, 3, 10, 1, 7, 2, 8, 0, 5, 4];
const DRIFT_PATH = (() => {
  let d = "M0 40 L0 28";
  DRIFT_PEAKS.forEach((peak, i) => {
    const x = i * 100;
    d += ` Q${x + 50} ${peak} ${x + 100} 28`;
  });
  return `${d} L1200 40 Z`;
})();

export function SnowDrift({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 40"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`-my-px block h-6 w-full md:h-10 ${className}`}
    >
      <path d={DRIFT_PATH} fill="currentColor" />
    </svg>
  );
}

// A small white drift of snow to sit on top of a block or tile. Stretches to
// whatever width it is given; the outline stays a constant weight.
const CAP_EDGE = "C6 14 8 4 20 4 C30 4 32 10 42 10 C52 10 56 2 68 3 C80 4 84 10 90 9 C95 8 97 14 100 14";

export function SnowCap({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 22" preserveAspectRatio="none" aria-hidden="true" className={className}>
      <path d={`M0 22 V14 ${CAP_EDGE} V22 Z`} fill="#fff" />
      <path
        d={`M0 14 ${CAP_EDGE}`}
        fill="none"
        className="stroke-ink"
        strokeWidth="3"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

// Gently falling snow. Positions and timings are derived from the index
// rather than Math.random so server and client render the same markup.
// "light" suits pale backgrounds (blue flakes, outlined snowballs); "dark"
// suits the night band (all white).
export function Snowfall({
  count = 28,
  tone = "light",
  className = "",
}: {
  count?: number;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={`snowfall pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {Array.from({ length: count }, (_, i) => {
        const duration = 9 + (i % 5) * 2.2;
        const isFlake = i % 3 === 0;
        const size = isFlake ? 14 + (i % 4) * 4 : 5 + (i % 3) * 2;
        const flakeColor =
          tone === "dark" ? "text-white" : i % 2 === 0 ? "text-sky" : "text-periwinkle";
        const dot =
          tone === "dark" ? "bg-white/90" : "bg-white ring-2 ring-ice";
        return (
          <div
            key={i}
            className="snowfall-column"
            style={{
              left: `${(i * 37 + 11) % 100}%`,
              animationDuration: `${duration}s`,
              animationDelay: `${-((i * 1.7) % duration)}s`,
            }}
          >
            <div
              className="snowfall-flake"
              style={{ animationDuration: `${2.5 + (i % 3)}s`, animationDelay: `${-i * 0.3}s` }}
            >
              {isFlake ? (
                <Snowflake className={`block ${flakeColor}`} style={{ width: size, height: size }} />
              ) : (
                <span className={`block rounded-full ${dot}`} style={{ width: size, height: size }} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  chip = "ice",
  squiggle = "berry",
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
          light ? "text-snow" : "text-ink"
        }`}
      >
        {title}
      </h2>
      <Squiggle className={`mx-auto mt-2 h-4 w-28 ${TEXT[squiggle]}`} />
    </div>
  );
}
