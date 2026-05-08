export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface DayCell {
  day: number;
  weekday: number;
  weekIdx: number;
  iso: string;
}

export function daysInMonth(year: number, monthIdx: number): number {
  return new Date(year, monthIdx + 1, 0).getDate();
}

export function buildMonthDays(year: number, monthIdx: number): DayCell[] {
  const total = daysInMonth(year, monthIdx);
  const days: DayCell[] = [];
  for (let d = 1; d <= total; d++) {
    const date = new Date(year, monthIdx, d);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    days.push({
      day: d,
      weekday: date.getDay(),
      weekIdx: Math.floor((d - 1) / 7),
      iso: `${yyyy}-${mm}-${dd}`,
    });
  }
  return days;
}

export function groupIntoWeeks(days: DayCell[]): DayCell[][] {
  const weeks: DayCell[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export function pct(num: number, denom: number): number {
  if (!denom) return 0;
  return Math.round((num / denom) * 100);
}

export function todayCapForMonth(year: number, monthIdx: number, totalDays: number): number {
  const t = new Date();
  if (t.getFullYear() === year && t.getMonth() === monthIdx) return t.getDate();
  // Past month: full month tracked. Future month: zero.
  if (year < t.getFullYear() || (year === t.getFullYear() && monthIdx < t.getMonth())) {
    return totalDays;
  }
  return 0;
}

export function isCurrentMonth(year: number, monthIdx: number): boolean {
  const t = new Date();
  return t.getFullYear() === year && t.getMonth() === monthIdx;
}
