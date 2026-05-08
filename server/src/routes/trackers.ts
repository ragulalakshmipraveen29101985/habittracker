import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireUser } from "../auth/middleware.js";

export const trackersRouter = Router();
trackersRouter.use(requireUser);

const accentSchema = z.enum(["sage", "coral", "navy"]);

// Active list — archived trackers are hidden here.
trackersRouter.get("/", async (req, res, next) => {
  try {
    const trackers = await prisma.tracker.findMany({
      where: { userId: req.userId!, archivedAt: null },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      include: { habits: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] } },
    });
    res.json(trackers);
  } catch (err) {
    next(err);
  }
});

// Archive list.
trackersRouter.get("/archived", async (req, res, next) => {
  try {
    const trackers = await prisma.tracker.findMany({
      where: { userId: req.userId!, archivedAt: { not: null } },
      orderBy: { archivedAt: "desc" },
      include: { habits: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] } },
    });
    res.json(trackers);
  } catch (err) {
    next(err);
  }
});

trackersRouter.post("/", async (req, res, next) => {
  try {
    const body = z
      .object({
        name: z.string().trim().min(1).max(80),
        emoji: z.string().min(1).max(8),
        accent: accentSchema,
        habits: z
          .array(z.object({ name: z.string().trim().min(1).max(80) }))
          .min(1)
          .max(40),
      })
      .parse(req.body);

    const last = await prisma.tracker.findFirst({
      where: { userId: req.userId! },
      orderBy: { position: "desc" },
    });
    const nextPos = last ? last.position + 1 : 0;

    const tracker = await prisma.tracker.create({
      data: {
        userId: req.userId!,
        name: body.name,
        emoji: body.emoji,
        accent: body.accent,
        position: nextPos,
        habits: {
          create: body.habits.map((h, i) => ({ name: h.name, position: i })),
        },
      },
      include: { habits: { orderBy: { position: "asc" } } },
    });
    res.status(201).json(tracker);
  } catch (err) {
    next(err);
  }
});

trackersRouter.patch("/:id", async (req, res, next) => {
  try {
    const body = z
      .object({
        name: z.string().trim().min(1).max(80).optional(),
        emoji: z.string().min(1).max(8).optional(),
        accent: accentSchema.optional(),
      })
      .parse(req.body);

    const existing = await prisma.tracker.findFirst({
      where: { id: req.params.id, userId: req.userId!, archivedAt: null },
    });
    if (!existing) {
      res.status(404).json({ error: "Tracker not found" });
      return;
    }
    const updated = await prisma.tracker.update({
      where: { id: existing.id },
      data: body,
      include: { habits: { orderBy: { position: "asc" } } },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Soft-delete (archive) on first call. Hard-delete on second call (when already archived).
trackersRouter.delete("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.tracker.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });
    if (!existing) {
      res.status(404).json({ error: "Tracker not found" });
      return;
    }
    if (existing.archivedAt === null) {
      await prisma.tracker.update({
        where: { id: existing.id },
        data: { archivedAt: new Date() },
      });
      res.json({ ok: true, archived: true });
      return;
    }
    await prisma.tracker.delete({ where: { id: existing.id } });
    res.json({ ok: true, deleted: true });
  } catch (err) {
    next(err);
  }
});

trackersRouter.post("/:id/unarchive", async (req, res, next) => {
  try {
    const existing = await prisma.tracker.findFirst({
      where: { id: req.params.id, userId: req.userId!, archivedAt: { not: null } },
    });
    if (!existing) {
      res.status(404).json({ error: "Archived tracker not found" });
      return;
    }
    const updated = await prisma.tracker.update({
      where: { id: existing.id },
      data: { archivedAt: null },
      include: { habits: { orderBy: { position: "asc" } } },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Habits nested under tracker (only on active trackers).
trackersRouter.post("/:id/habits", async (req, res, next) => {
  try {
    const { name } = z
      .object({ name: z.string().trim().min(1).max(80) })
      .parse(req.body);
    const tracker = await prisma.tracker.findFirst({
      where: { id: req.params.id, userId: req.userId!, archivedAt: null },
    });
    if (!tracker) {
      res.status(404).json({ error: "Tracker not found" });
      return;
    }
    const last = await prisma.habit.findFirst({
      where: { trackerId: tracker.id },
      orderBy: { position: "desc" },
    });
    const habit = await prisma.habit.create({
      data: { trackerId: tracker.id, name, position: last ? last.position + 1 : 0 },
    });
    res.status(201).json(habit);
  } catch (err) {
    next(err);
  }
});

// Range query: completions for one (active) tracker between dates.
trackersRouter.get("/:id/completions", async (req, res, next) => {
  try {
    const q = z
      .object({
        from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
      .parse(req.query);

    const tracker = await prisma.tracker.findFirst({
      where: { id: req.params.id, userId: req.userId!, archivedAt: null },
      include: { habits: { select: { id: true } } },
    });
    if (!tracker) {
      res.status(404).json({ error: "Tracker not found" });
      return;
    }
    const habitIds = tracker.habits.map((h) => h.id);
    if (habitIds.length === 0) {
      res.json([]);
      return;
    }
    const completions = await prisma.completion.findMany({
      where: {
        habitId: { in: habitIds },
        date: { gte: new Date(q.from), lte: new Date(q.to) },
      },
      select: { habitId: true, date: true },
    });
    res.json(
      completions.map((c) => ({
        habitId: c.habitId,
        date: c.date.toISOString().slice(0, 10),
      })),
    );
  } catch (err) {
    next(err);
  }
});
