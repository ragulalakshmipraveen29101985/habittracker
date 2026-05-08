// Seed data + helpers shared across screens.
// Pre-fills realistic completion patterns so the pictorial views look alive.

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const DAY_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Simple deterministic pseudo-random so pre-filled data is stable per (tracker, habit, day).
function hashFill(trackerId, habitId, day, bias = 0.62) {
  let h = 2166136261;
  const s = `${trackerId}|${habitId}|${day}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const n = ((h >>> 0) % 1000) / 1000;
  return n < bias;
}

function daysInMonth(year, monthIdx /* 0-11 */) {
  return new Date(year, monthIdx + 1, 0).getDate();
}

function firstWeekday(year, monthIdx) {
  return new Date(year, monthIdx, 1).getDay(); // 0 Sun .. 6 Sat
}

// Build the list of {day, weekday, weekIdx} for a month, where weekIdx
// groups by Mon-Sun weeks anchored to month start (Excel-style sequential weeks of 7).
function buildMonthDays(year, monthIdx) {
  const total = daysInMonth(year, monthIdx);
  const days = [];
  for (let d = 1; d <= total; d++) {
    const date = new Date(year, monthIdx, d);
    days.push({
      day: d,
      weekday: date.getDay(),
      weekIdx: Math.floor((d - 1) / 7), // 0..4
      iso: date.toISOString().slice(0, 10),
    });
  }
  return days;
}

// Build initial completions object for a tracker:
// { [habitId]: Set of day numbers that are checked }
function buildInitialCompletions(tracker, days, bias) {
  const out = {};
  const today = new Date();
  const sameMonth = today.getFullYear() === tracker.year && today.getMonth() === tracker.monthIdx;
  const cap = sameMonth ? today.getDate() : days.length;
  tracker.habits.forEach((h) => {
    const set = new Set();
    for (let d = 1; d <= cap; d++) {
      if (hashFill(tracker.id, h.id, d, bias ?? h.bias ?? 0.62)) set.add(d);
    }
    out[h.id] = set;
  });
  return out;
}

const TODAY = new Date();
const Y = TODAY.getFullYear();
const M = TODAY.getMonth();

const SEED_TRACKERS = [
  {
    id: "t-morning",
    name: "Morning Routine",
    emoji: "☼",
    accent: "sage",
    monthIdx: M,
    year: Y,
    habits: [
      { id: "h1", name: "Daily Exercise", bias: 0.7 },
      { id: "h2", name: "Bed Before 11pm", bias: 0.55 },
      { id: "h3", name: "Drink Protein", bias: 0.78 },
      { id: "h4", name: "Eat Vegetables", bias: 0.72 },
      { id: "h5", name: "Call Grandparents", bias: 0.30 },
      { id: "h6", name: "No Snacks", bias: 0.48 },
      { id: "h7", name: "Do Homework", bias: 0.83 },
      { id: "h8", name: "Water Plants", bias: 0.66 },
      { id: "h9", name: "Read 10+ Pages", bias: 0.74 },
      { id: "h10", name: "Make Bed", bias: 0.91 },
    ],
  },
  {
    id: "t-fitness",
    name: "Fitness & Body",
    emoji: "◐",
    accent: "coral",
    monthIdx: M,
    year: Y,
    habits: [
      { id: "f1", name: "Strength Training", bias: 0.55 },
      { id: "f2", name: "10k Steps", bias: 0.68 },
      { id: "f3", name: "Stretch 10 min", bias: 0.62 },
      { id: "f4", name: "8 Glasses Water", bias: 0.74 },
      { id: "f5", name: "Sleep 7+ hrs", bias: 0.6 },
      { id: "f6", name: "No Soda", bias: 0.81 },
    ],
  },
  {
    id: "t-mind",
    name: "Mind & Reading",
    emoji: "✦",
    accent: "navy",
    monthIdx: M,
    year: Y,
    habits: [
      { id: "m1", name: "Meditate 10 min", bias: 0.5 },
      { id: "m2", name: "Journal", bias: 0.42 },
      { id: "m3", name: "Read fiction", bias: 0.66 },
      { id: "m4", name: "No social media until noon", bias: 0.38 },
      { id: "m5", name: "Learn Spanish 15 min", bias: 0.56 },
    ],
  },
];

// Group days into Excel-style "Week 1, Week 2…" buckets of 7 starting at day 1.
function groupIntoWeeks(days) {
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

function pct(num, denom) {
  if (!denom) return 0;
  return Math.round((num / denom) * 100);
}

Object.assign(window, {
  MONTH_NAMES, DAY_SHORT,
  daysInMonth, firstWeekday, buildMonthDays, groupIntoWeeks,
  buildInitialCompletions, hashFill, pct,
  SEED_TRACKERS,
});
