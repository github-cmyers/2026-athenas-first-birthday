import {
  eventDay,
  EVENT_TIME_ZONE,
  PARTY_END,
  partyDate,
  VENUE,
} from "./event";

// Party-day weather from Open-Meteo: free, no API key, CC BY 4.0 (the card
// credits it). Forecasts reach about 16 days ahead; the card appears 14 days
// out to stay safely inside that range.
const FORECAST_RANGE_DAYS = 14;

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

// Null whenever there is nothing worth showing: the party is too far off for
// a forecast, already over, or the weather service is slow or down. The page
// never waits more than a few seconds on it, and a result is reused for an
// hour so guests' visits don't each call the service.
export async function getPartyForecast(now: Date = new Date()): Promise<PartyForecast | null> {
  const daysAway = (partyDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
  if (daysAway > FORECAST_RANGE_DAYS || now >= PARTY_END) return null;

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
