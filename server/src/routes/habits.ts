import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireUser } from "../auth/middleware.js";

export const habitsRouter = Router();
habitsRouter.use(requireUser);

async function ownsHabit(userId: string, habitId: string) {
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, tracker: { userId, archivedAt: null } },
  });
  return habit;
}

habitsRouter.patch("/:id", async (req, res, next) => {
  try {
    const { name } = z
      .object({ name: z.string().trim().min(1).max(80) })
      .parse(req.body);
    const habit = await ownsHabit(req.userId!, req.params.id);
    if (!habit) {
      res.status(404).json({ error: "Habit not found" });
      return;
    }
    const updated = await prisma.habit.update({
      where: { id: habit.id },
      data: { name },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

habitsRouter.delete("/:id", async (req, res, next) => {
  try {
    const habit = await ownsHabit(req.userId!, req.params.id);
    if (!habit) {
      res.status(404).json({ error: "Habit not found" });
      return;
    }
    await prisma.habit.delete({ where: { id: habit.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
