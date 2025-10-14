const SECONDS_IN = {
  minute: 60,
  hour: 60 * 60,
  day: 60 * 60 * 24,
  week: 60 * 60 * 24 * 7,
  month: 60 * 60 * 24 * 30,
  year: 60 * 60 * 24 * 365,
} as const;

type TimeUnit = keyof typeof SECONDS_IN;

const UNITS: { unit: TimeUnit; threshold: number }[] = [
  { unit: "minute", threshold: SECONDS_IN.hour },
  { unit: "hour", threshold: SECONDS_IN.day },
  { unit: "day", threshold: SECONDS_IN.week },
  { unit: "week", threshold: SECONDS_IN.month },
  { unit: "month", threshold: SECONDS_IN.year },
];

function pluralise(value: number, unit: string): string {
  return `${value} ${unit}${value === 1 ? "" : "s"}`;
}

export function formatTimeAgo(timestamp: number, now: number = Date.now()): string {
  if (!Number.isFinite(timestamp)) {
    return "some time ago";
  }

  const deltaSeconds = Math.floor((now - timestamp) / 1000);

  if (deltaSeconds <= 0) {
    return "just now";
  }

  if (deltaSeconds < SECONDS_IN.minute) {
    return `${deltaSeconds} ${deltaSeconds === 1 ? "second" : "seconds"} ago`;
  }

  for (const { unit, threshold } of UNITS) {
    if (deltaSeconds < threshold) {
      const divisor = SECONDS_IN[unit];
      const value = Math.floor(deltaSeconds / divisor);
      return `${pluralise(value, unit)} ago`;
    }
  }

  const years = Math.floor(deltaSeconds / SECONDS_IN.year);
  return `${pluralise(years, "year")} ago`;
}
