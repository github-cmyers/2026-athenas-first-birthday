import type { Metadata } from "next";
import { toString as qrToSvg } from "qrcode";
import { Bunting, OWL_COLORS, PartyOwl } from "../components/decor";
import LanguageToggle from "../components/LanguageToggle";
import PrintButton from "./PrintButton";
import { formatEventDate, formatEventTime, partyDate, VENUE } from "@/lib/event";
import { getMessages } from "@/lib/i18n";
import { firstParam, hrefWithLang, resolveLang, type SearchParams } from "@/lib/lang";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Printable invitation · Athena's First Birthday",
  robots: { index: false },
};

// Same lettering as the hero's "ONE!", at card size.
const LETTERS = [
  { char: "O", color: "text-blush", tilt: "-rotate-6" },
  { char: "N", color: "text-sky", tilt: "rotate-3" },
  { char: "E", color: "text-glacier", tilt: "-rotate-3" },
  { char: "!", color: "text-periwinkle", tilt: "rotate-6" },
];

// Only this page prints at 5x7 with no margins; the rules live here rather
// than in globals.css so printing the main site is unaffected. Colours and the
// snowflake background are kept when printing (browsers drop backgrounds by
// default).
const PRINT_CSS = `
  @page { size: 5in 7in; margin: 0; }
  @media print {
    html, body { margin: 0 !important; background: #fff !important; }
    .no-print { display: none !important; }
    .invite-stage { display: block !important; min-height: 0 !important; padding: 0 !important; background: none !important; }
    .invite-card { margin: 0 !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; }
    .invite-card, .invite-card * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`;

// A printable 5x7 invitation, for guests who prefer paper. The QR code opens
// the site (in French, for the French card) so they can RSVP from their phone.
export default async function InvitePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const lang = await resolveLang(firstParam(params.lang));
  const t = getMessages(lang);

  // The QR code must hold the site's public address. Set SITE_URL in
  // production so a card printed from anywhere points at the real site.
  const base = await siteUrl();
  const target = new URL(lang === "fr" ? "/?lang=fr" : "/", base);
  const qrSvg = await qrToSvg(target.toString(), {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: OWL_COLORS.ink, light: "#ffffff" },
  });

  return (
    <div lang={lang} className="invite-stage flex min-h-screen flex-col items-center gap-6 overflow-x-auto bg-ink/10 px-4 py-8">
      <style>{PRINT_CSS}</style>

      <div className="no-print flex w-full max-w-[5in] flex-col items-center gap-3 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <PrintButton label={t.invite.print} />
          <LanguageToggle lang={lang} href={hrefWithLang("/invite", params, lang === "en" ? "fr" : "en")} />
        </div>
        <p className="text-sm text-ink/70">{t.invite.tip}</p>
        <a href={lang === "fr" ? "/?lang=fr" : "/"} className="text-sm font-semibold text-ink underline decoration-2 underline-offset-2">
          ← {t.invite.back}
        </a>
      </div>

      <article className="invite-card snowy relative flex h-[7in] w-[5in] shrink-0 flex-col items-center overflow-hidden rounded-2xl border-[3px] border-ink text-center text-ink shadow-[6px_6px_0_0_var(--color-ink)]">
        <div className="flex w-full">
          <Bunting flags={7} className="flex-1" />
        </div>

        <div className="-mt-6 flex flex-1 flex-col items-center justify-between px-8 pb-8">
          <div className="flex flex-col items-center">
            <span className="chip -rotate-3 bg-ice">{t.hero.chip.upcoming}</span>
            <p lang="en" className="mt-4 font-display text-[1.65rem] font-semibold leading-tight">
              Look whooo&apos;s turning
            </p>
            <div className="mt-1 flex items-center gap-3">
              <div aria-hidden="true" className="flex gap-1 text-[4.6rem]">
                {LETTERS.map((letter) => (
                  <span key={letter.char} className={`inline-block ${letter.tilt}`}>
                    <span className={`giant-letter ${letter.color}`}>{letter.char}</span>
                  </span>
                ))}
              </div>
              <PartyOwl className="w-[5.5rem] shrink-0" />
            </div>
          </div>

          <div>
            <h1 className="font-display text-[1.75rem] font-bold leading-tight">{t.hero.title}</h1>
            <p className="mt-2 font-display text-lg font-medium">
              {formatEventDate(partyDate, lang)} · {formatEventTime(partyDate, lang)}
            </p>
            <p className="mt-2 text-sm leading-snug text-ink/80">{VENUE.address}</p>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border-[3px] border-ink bg-white p-3 text-left shadow-[4px_4px_0_0_var(--color-ink)]">
            {/* The SVG comes from the QR library and contains only drawn
                squares - the URL is encoded as modules, never as markup - so
                inserting it as HTML is safe. */}
            <div
              aria-hidden="true"
              className="h-28 w-28 shrink-0 [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <div>
              <p className="font-display text-xl font-semibold leading-tight">{t.invite.scan}</p>
              <p className="mt-1 text-sm text-ink/70">{t.invite.orVisit}</p>
              <p className="break-all font-semibold">{target.host}</p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
