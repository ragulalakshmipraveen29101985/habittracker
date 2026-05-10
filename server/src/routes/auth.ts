import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { signToken } from "../auth/jwt.js";
import { requireUser } from "../auth/middleware.js";
import { seedTrackersForUser } from "../sampleSeed.js";

export const authRouter = Router();

const stripPassword = <T extends { passwordHash?: string }>(u: T) => {
  const { passwordHash, ...rest } = u;
  return rest;
};

const emailSchema = z.string().trim().toLowerCase().email().max(160);
const passwordSchema = z.string().min(8).max(128);
const firstNameSchema = z.string().trim().min(1).max(60);

authRouter.post("/signup", async (req, res, next) => {
  try {
    const { email, password, firstName } = z
      .object({
        email: emailSchema,
        password: passwordSchema,
        firstName: firstNameSchema,
      })
      .parse(req.body);

    const passwordHash = await bcrypt.hash(password, 10);

    let user;
    try {
      user = await prisma.user.create({
        data: { email, passwordHash, firstName, name: firstName },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        res.status(409).json({ error: "Account already exists" });
        return;
      }
      throw e;
    }

    try {
      await seedTrackersForUser(user.id);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[seed] failed for new user:", e);
    }

    const token = signToken({ uid: user.id });
    res.json({ token, user: stripPassword(user) });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = z
      .object({ email: emailSchema, password: z.string().min(1).max(128) })
      .parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = signToken({ uid: user.id });
    res.json({ token, user: stripPassword(user) });
  } catch (err) {
    next(err);
  }
});

authRouter.get("/me", requireUser, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ user: stripPassword(user) });
  } catch (err) {
    next(err);
  }
});

authRouter.patch("/me", requireUser, async (req, res, next) => {
  try {
    const { firstName, lastName, email } = z
      .object({
        firstName: z.string().trim().min(1).max(40),
        lastName: z.string().trim().min(1).max(40),
        email: emailSchema,
      })
      .parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: {
        firstName,
        lastName,
        email,
        name: `${firstName} ${lastName}`,
      },
    });
    res.json({ user: stripPassword(user) });
  } catch (err) {
    next(err);
  }
});
