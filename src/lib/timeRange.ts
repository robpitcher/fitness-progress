export type TimeRange = "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL";

export const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "1W", label: "1W" },
  { value: "1M", label: "1M" },
  { value: "3M", label: "3M" },
  { value: "6M", label: "6M" },
  { value: "1Y", label: "1Y" },
  { value: "ALL", label: "All" },
];

export const DEFAULT_TIME_RANGE: TimeRange = "3M";

export function getStartDate(range: TimeRange): Date | null {
  if (range === "ALL") return null;
  const now = new Date();
  switch (range) {
    case "1W":
      now.setDate(now.getDate() - 7);
      break;
    case "1M":
      now.setMonth(now.getMonth() - 1);
      break;
    case "3M":
      now.setMonth(now.getMonth() - 3);
      break;
    case "6M":
      now.setMonth(now.getMonth() - 6);
      break;
    case "1Y":
      now.setFullYear(now.getFullYear() - 1);
      break;
  }
  return now;
}

export function filterByDateRange<T extends { date: string }>(
  data: T[],
  range: TimeRange,
): T[] {
  const start = getStartDate(range);
  const startISO = start.toISOString().slice(0, 10);
  return data.filter((d) => d.date >= startISO);
}
