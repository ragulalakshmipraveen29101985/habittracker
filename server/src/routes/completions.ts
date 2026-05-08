import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireUser } from "../auth/middleware.js";

export const completionsRouter = Router();
completionsRouter.use(requireUser);

completionsRouter.post("/toggle", async (req, res, next) => {
  try {
    const { habitId, date } = z
      .object({
        habitId: z.string().uuid(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
      .parse(req.body);

    // Auth check: user must own the habit, and tracker must be active
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, tracker: { userId: req.userId!, archivedAt: null } },
    });
    if (!habit) {
      res.status(404).json({ error: "Habit not found" });
      return;
    }
    const dateOnly = new Date(date);
    const existing = await prisma.completion.findUnique({
      where: { habitId_date: { habitId, date: dateOnly } },
    });
    if (existing) {
      await prisma.completion.delete({ where: { id: existing.id } });
      res.json({ on: false });
      return;
    }
    await prisma.completion.create({
      data: { habitId, date: dateOnly },
    });
    res.json({ on: true });
  } catch (err) {
    next(err);
  }
});
