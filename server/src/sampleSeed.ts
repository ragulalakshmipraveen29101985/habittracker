// Default tracker seeder — runs on first user signup so the dashboard isn't empty.
// New users get one starter "Morning Routine" tracker with 6 habits, no completions.

import { prisma } from "./db.js";

const DEFAULT_TRACKER = {
  name: "Morning Routine",
  emoji: "☼",
  accent: "sage",
  habits: [
    { name: "Daily Exercise" },
    { name: "Bed Before 11pm" },
    { name: "Drink Protein" },
    { name: "Eat Vegetables" },
    { name: "Read 10+ Pages" },
    { name: "Make Bed" },
  ],
} as const;

export async function seedTrackersForUser(userId: string) {
  await prisma.tracker.create({
    data: {
      userId,
      name: DEFAULT_TRACKER.name,
      emoji: DEFAULT_TRACKER.emoji,
      accent: DEFAULT_TRACKER.accent,
      position: 0,
      habits: {
        create: DEFAULT_TRACKER.habits.map((h, i) => ({ name: h.name, position: i })),
      },
    },
  });
}
