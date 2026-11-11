import {
  eventDay,
  EVENT_TIME_ZONE,
  PARTY_END,
  partyDate,
  VENUE,
} from "./event";

// Party-day weather from Open-Meteo: free, no API key, CC BY 4.0 (the card
// credits it). Forecasts reach about 16 days ahead; the live forecast is used
// from 14 days out to stay safely inside that range. Before then, the card
// shows a "Snow Prediction" from weather history instead.
const FORECAST_RANGE_DAYS = 14;

// What 30 years of weather history say about the party date at the venue,
// from Open-Meteo's historical archive (ERA5). Worked out once and kept here
// rather than fetched per visit: the archive takes a minute or more to answer,
// and the past doesn't change.
//
// chancePercent: share of days within 3 days of Dec 19 with at least 0.1" of
// snow. typicalHigh/Low: median °F over the same days. years/lastYear: the
// span of history used.
//
// Recompute with scripts/snow-history.mjs if the date or the venue's town
// changes.
export const SNOW_HISTORY = {
  years: 30,
  lastYear: 2025,
  chancePercent: 14,
  typicalHigh: 40,
  typicalLow: 27,
};

export interface PartyForecast {
  code: number; // WMO weather code for the day
  high: number; // °F
  low: number; // °F
  atStart: number | null; // °F at the party's start hour
  precipitationChance: number | null; // %
  snowInches: number;
}

// The party's start hour on the local clock, e.g. "16", to find it in the
// hourly series (whose times are local wall-clock strings).
function startHour(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: EVENT_TIME_ZONE,
    hour: "2-digit",
    hourCycle: "h23",
  }).format(partyDate);
}

export function forecastUrl(): URL {
  const day = eventDay(partyDate);
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: String(VENUE.latitude),
    longitude: String(VENUE.longitude),
    timezone: EVENT_TIME_ZONE,
    temperature_unit: "fahrenheit",
    precipitation_unit: "inch",
    start_date: day,
    end_date: day,
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,snowfall_sum",
    hourly: "temperature_2m",
  }).toString();
  return url;
}

interface OpenMeteoResponse {
  daily?: {
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: (number | null)[];
    snowfall_sum?: (number | null)[];
  };
  hourly?: { time?: string[]; temperature_2m?: (number | null)[] };
}

export function parseForecast(data: OpenMeteoResponse): PartyForecast | null {
  const d = data.daily;
  const code = d?.weather_code?.[0];
  const high = d?.temperature_2m_max?.[0];
  const low = d?.temperature_2m_min?.[0];
  if (code == null || high == null || low == null) return null;

  const startStamp = `${eventDay(partyDate)}T${startHour()}:00`;
  const hourIndex = data.hourly?.time?.indexOf(startStamp) ?? -1;

  return {
    code,
    high,
    low,
    atStart: hourIndex >= 0 ? (data.hourly?.temperature_2m?.[hourIndex] ?? null) : null,
    precipitationChance: d?.precipitation_probability_max?.[0] ?? null,
    snowInches: d?.snowfall_sum?.[0] ?? 0,
  };
}

// The live forecast, or null if the weather service is slow or down. The page
// never waits more than a few seconds on it, and a result is reused for an
// hour so guests' visits don't each call the service.
async function fetchPartyForecast(): Promise<PartyForecast | null> {
  try {
    const res = await fetch(forecastUrl(), {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    return parseForecast(await res.json());
  } catch {
    return null;
  }
}

export type PartyWeather =
  | { kind: "forecast"; forecast: PartyForecast }
  // `forecastSoon`: the live forecast hasn't started yet (as opposed to
  // being in range but unreachable right now).
  | { kind: "history"; forecastSoon: boolean };

// What the weather card shows: the live forecast from 14 days out, and the
// snow prediction from history before that - or whenever the live forecast
// can't be reached, so the card is always there. Null only once the party is
// over.
export async function getPartyWeather(now: Date = new Date()): Promise<PartyWeather | null> {
  if (now >= PARTY_END) return null;

  const daysAway = (partyDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
  if (daysAway > FORECAST_RANGE_DAYS) return { kind: "history", forecastSoon: true };

  const forecast = await fetchPartyForecast();
  return forecast ? { kind: "forecast", forecast } : { kind: "history", forecastSoon: false };
}
