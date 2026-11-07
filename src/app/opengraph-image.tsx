import { ImageResponse } from "next/og";
import { OWL_COLORS, PartyOwl, Snowflake } from "./components/decor";
import { formatEventDate, formatEventTime, partyDate } from "@/lib/event";

// The image shown when the site's link is shared in iMessage, WhatsApp,
// Facebook and the like. Next turns this file into /opengraph-image and adds
// the og:image tags to every page. It is rendered once at build time, and the
// date comes from event.ts, so it can never disagree with the site.

export const alt = "Athena's First Birthday - Look whooo's turning ONE!";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = OWL_COLORS.ink;
const ONE_LETTERS = [
  { char: "O", color: "#f9b4cf" },
  { char: "N", color: "#74b9ee" },
  { char: "E", color: "#92e0dd" },
  { char: "!", color: "#b3b5f7" },
];
const FLAG_COLORS = ["#f9b4cf", "#74b9ee", "#92e0dd", "#b3b5f7", "#ec6f9c", "#bfe3fb"];

// Snowflakes scattered around the edges, clear of the owl and the text.
const FLAKES = [
  { left: 40, top: 120, size: 34, color: "#74b9ee" },
  { left: 470, top: 110, size: 26, color: "#b3b5f7" },
  { left: 1120, top: 150, size: 38, color: "#74b9ee" },
  { left: 60, top: 540, size: 28, color: "#b3b5f7" },
  { left: 1110, top: 520, size: 30, color: "#f9b4cf" },
  { left: 520, top: 560, size: 24, color: "#92e0dd" },
];

// Fetches Fredoka (the site's display face) from Google Fonts, subset to just
// the characters drawn. The image renderer needs TrueType/OpenType, which is
// what Google serves to a non-browser client. If the fetch fails the image
// still builds, in the renderer's default font.
async function loadFredoka(weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=Fredoka:wght@${weight}&text=${encodeURIComponent(text)}`
      )
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    const res = await fetch(url);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

// Pennant flags hung along a sagging string across the top edge.
function Garland() {
  const count = 15;
  return (
    <svg width="1200" height="90" viewBox="0 0 1200 90" style={{ position: "absolute", top: 0, left: 0 }}>
      <path d="M0 6 Q600 70 1200 6" fill="none" stroke={INK} strokeWidth="3" />
      {Array.from({ length: count }, (_, i) => {
        const t = (i + 1) / (count + 1);
        const x = t * 1200;
        const y = 6 + 128 * t * (1 - t);
        return (
          <path
            key={i}
            d={`M${x - 19} ${y} L${x + 19} ${y} L${x} ${y + 42} Z`}
            fill={FLAG_COLORS[i % FLAG_COLORS.length]}
            stroke={INK}
            strokeWidth="3"
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}

export default async function OpengraphImage() {
  const title = "Athena's First Birthday";
  const lead = "Look whooo's turning";
  const when = `${formatEventDate(partyDate)} · ${formatEventTime(partyDate)}`;
  const chip = "YOU'RE INVITED!";

  const [semibold, bold] = await Promise.all([
    loadFredoka(600, lead + when + chip),
    loadFredoka(700, title + ONE_LETTERS.map((l) => l.char).join("")),
  ]);
  const fonts = [
    ...(semibold ? [{ name: "Fredoka", data: semibold, weight: 600 as const, style: "normal" as const }] : []),
    ...(bold ? [{ name: "Fredoka", data: bold, weight: 700 as const, style: "normal" as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          position: "relative",
          background: "linear-gradient(180deg, #d9edfd 0%, #f5f9ff 75%)",
          fontFamily: "Fredoka",
          color: INK,
        }}
      >
        <Garland />

        {FLAKES.map((f, i) => (
          <div key={i} style={{ position: "absolute", left: f.left, top: f.top, display: "flex" }}>
            <Snowflake color={f.color} style={{ width: f.size, height: f.size }} />
          </div>
        ))}

        <div style={{ display: "flex", justifyContent: "center", width: 480, paddingTop: 50 }}>
          <PartyOwl width={360} height={428} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", paddingTop: 50, paddingRight: 60 }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "6px 22px",
              borderRadius: 999,
              border: `4px solid ${INK}`,
              background: "#bfe3fb",
              boxShadow: `4px 4px 0 0 ${INK}`,
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            {chip}
          </div>

          <div style={{ display: "flex", marginTop: 18, fontSize: 50, fontWeight: 600 }}>{lead}</div>

          <div style={{ display: "flex", marginTop: -6 }}>
            {ONE_LETTERS.map((letter) => (
              <span
                key={letter.char}
                style={{
                  fontSize: 150,
                  fontWeight: 700,
                  lineHeight: 1,
                  marginRight: 6,
                  color: letter.color,
                  WebkitTextStroke: `8px ${INK}`,
                  textShadow: `7px 7px 0 ${INK}`,
                }}
              >
                {letter.char}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", marginTop: 10, fontSize: 58, fontWeight: 700 }}>{title}</div>
          <div style={{ display: "flex", marginTop: 8, fontSize: 32, fontWeight: 600, opacity: 0.8 }}>
            {when}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
