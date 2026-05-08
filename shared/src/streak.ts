// Streak / summary computations over a set of completed day numbers within a month.

export interface HabitStat {
  done: number;
  cap: number;
  pct: number;
  streak: number;   // current run, ending at cap
  longest: number;  // longest run within the month
}

export function computeHabitStat(completedDays: Set<number>, cap: number): HabitStat {
  let done = 0;
  for (let d = 1; d <= cap; d++) if (completedDays.has(d)) done++;
  let cur = 0;
  for (let d = cap; d >= 1; d--) {
    if (completedDays.has(d)) cur++;
    else break;
  }
  let longest = 0, run = 0;
  for (let d = 1; d <= cap; d++) {
    if (completedDays.has(d)) { run++; longest = Math.max(longest, run); }
    else { run = 0; }
  }
  return {
    done,
    cap,
    pct: cap ? Math.round((done / cap) * 100) : 0,
    streak: cur,
    longest,
  };
}
