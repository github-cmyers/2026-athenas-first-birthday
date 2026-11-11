import { getPartyForecast } from "@/lib/forecast";
import { formatEventTime, partyDate } from "@/lib/event";
import { getMessages, type Lang, type Messages } from "@/lib/i18n";

type Condition = keyof Messages["forecast"]["conditions"];

// WMO weather codes, as used by Open-Meteo, grouped into what a guest cares
// about.
function describe(code: number): { icon: string; condition: Condition } {
  if (code === 0) return { icon: "☀️", condition: "clear" };
  if (code <= 2) return { icon: "🌤️", condition: "partlyCloudy" };
  if (code === 3) return { icon: "☁️", condition: "cloudy" };
  if (code === 45 || code === 48) return { icon: "🌫️", condition: "fog" };
  if (code >= 51 && code <= 55) return { icon: "🌦️", condition: "drizzle" };
  if (code === 56 || code === 57 || code === 66 || code === 67) return { icon: "🧊", condition: "freezingRain" };
  if (code >= 61 && code <= 65) return { icon: "🌧️", condition: "rain" };
  if (code >= 71 && code <= 77) return { icon: "❄️", condition: "snow" };
  if (code >= 80 && code <= 82) return { icon: "🌧️", condition: "showers" };
  if (code === 85 || code === 86) return { icon: "🌨️", condition: "snowShowers" };
  if (code >= 95) return { icon: "⛈️", condition: "storm" };
  return { icon: "☁️", condition: "cloudy" };
}

// The forecast tile in "Where & when". Renders nothing until the party is
// within forecast range, or if the weather service can't be reached.
export default async function PartyForecast({ lang }: { lang: Lang }) {
  const forecast = await getPartyForecast();
  if (!forecast) return null;

  const t = getMessages(lang).forecast;
  const { icon, condition } = describe(forecast.code);
  const snowy = condition === "snow" || condition === "snowShowers" || forecast.snowInches >= 0.1;
  const cold = (forecast.atStart ?? forecast.high) < 40;

  const details = [
    forecast.atStart !== null
      ? t.atStart(t.temp(forecast.atStart), formatEventTime(partyDate, lang))
      : null,
    t.range(t.temp(forecast.high), t.temp(forecast.low)),
    forecast.precipitationChance ? t.chance(forecast.precipitationChance) : null,
    forecast.snowInches >= 0.1 ? t.snow(forecast.snowInches) : null,
  ].filter(Boolean);

  return (
    <div className="flex items-start gap-4 rounded-2xl border-[2.5px] border-ink bg-periwinkle/20 p-4 text-left sm:col-span-2">
      <span
        aria-hidden="true"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[2.5px] border-ink bg-white text-2xl"
      >
        {icon}
      </span>
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-ink/60">{t.label}</div>
        <div className="font-display text-xl font-medium text-ink">{t.conditions[condition]}</div>
        <p className="text-base text-ink/75">{details.join(" · ")}</p>
        {(snowy || cold) && (
          <p className="mt-1 font-semibold text-ink">{snowy ? t.tipSnow : t.tipCold}</p>
        )}
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-xs text-ink/50 underline-offset-2 hover:underline"
        >
          {t.source}
        </a>
      </div>
    </div>
  );
}
