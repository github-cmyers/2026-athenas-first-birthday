// Recomputes SNOW_HISTORY in src/lib/forecast.ts: what 30 years of weather
// history say about the party date at the venue. Run it again if the party
// date or the venue's town changes, and paste the output over the old values.
//
// Usage: node scripts/snow-history.mjs <latitude> <longitude> <MM-DD> [lastYear]
//   e.g. node scripts/snow-history.mjs 41.85 -71.47 12-19 2025
//
// Data: Open-Meteo's historical archive (ERA5 reanalysis), free and keyless.
// The archive is slow for long date ranges, so this asks for one short window
// per year, one request at a time. It takes a minute or two.

const [lat, lon, monthDay, lastYearArg] = process.argv.slice(2);
if (!lat || !lon || !/^\d{2}-\d{2}$/.test(monthDay ?? "")) {
  console.error("Usage: node scripts/snow-history.mjs <latitude> <longitude> <MM-DD> [lastYear]");
  process.exit(1);
}

const YEARS = 30;
const WINDOW_DAYS = 3; // either side of the date, for a steadier estimate
const SNOW_INCHES = 0.1; // a measurable snowfall
const lastYear = Number(lastYearArg ?? new Date().getFullYear() - 1);
const [month, day] = monthDay.split("-").map(Number);

async function fetchYear(year) {
  const center = Date.UTC(year, month - 1, day);
  const iso = (ms) => new Date(ms).toISOString().slice(0, 10);
  const url = new URL("https://archive-api.open-meteo.com/v1/archive");
  url.search = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    timezone: "America/New_York",
    temperature_unit: "fahrenheit",
    precipitation_unit: "inch",
    start_date: iso(center - WINDOW_DAYS * 864e5),
    end_date: iso(center + WINDOW_DAYS * 864e5),
    daily: "snowfall_sum,temperature_2m_max,temperature_2m_min",
  });

  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { daily } = await res.json();
      return daily.time.map((_, i) => ({
        snow: daily.snowfall_sum[i] ?? 0,
        high: daily.temperature_2m_max[i],
        low: daily.temperature_2m_min[i],
      }));
    } catch (error) {
      // The archive limits concurrent requests; back off and retry.
      if (attempt === 6) throw new Error(`${year}: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 10_000 * attempt));
    }
  }
}

const days = [];
for (let year = lastYear - YEARS + 1; year <= lastYear; year++) {
  days.push(...(await fetchYear(year)));
  process.stderr.write(`${year} `);
}
process.stderr.write("\n");

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

console.log(
  JSON.stringify(
    {
      years: YEARS,
      lastYear,
      chancePercent: Math.round((days.filter((d) => d.snow >= SNOW_INCHES).length / days.length) * 100),
      typicalHigh: Math.round(median(days.map((d) => d.high))),
      typicalLow: Math.round(median(days.map((d) => d.low))),
    },
    null,
    2
  )
);
