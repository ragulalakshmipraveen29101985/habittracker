import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { createOtp, verifyOtp } from "../auth/otp.js";
import { sendSms } from "../auth/sms.js";
import { signToken } from "../auth/jwt.js";
import { env } from "../env.js";
import { requireUser } from "../auth/middleware.js";
import { seedTrackersForUser } from "../sampleSeed.js";

export const authRouter = Router();

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{6,15}$/, "Invalid phone number");

authRouter.post("/request-otp", async (req, res, next) => {
  try {
    const { phone } = z.object({ phone: phoneSchema }).parse(req.body);
    const normalized = phone.startsWith("+") ? phone : `+${phone}`;
    const { code } = await createOtp(normalized);
    await sendSms(normalized, code);
    res.json({ ok: true, ...(env.isDev ? { devOtp: code } : {}) });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/verify-otp", async (req, res, next) => {
  try {
    const { phone, code } = z
      .object({
        phone: phoneSchema,
        code: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
      })
      .parse(req.body);
    const normalized = phone.startsWith("+") ? phone : `+${phone}`;
    const ok = await verifyOtp(normalized, code);
    if (!ok) {
      res.status(401).json({ error: "Invalid or expired code" });
      return;
    }
    let user = await prisma.user.findUnique({ where: { phone: normalized } });
    let isNewUser = false;
    if (!user) {
      user = await prisma.user.create({ data: { phone: normalized } });
      isNewUser = true;
    }
    if (isNewUser) {
      try {
        await seedTrackersForUser(user.id);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("[seed] failed for new user:", e);
      }
    }
    const token = signToken({ uid: user.id });
    const needsProfile = user.firstName === null;
    res.json({ token, user, needsProfile });
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
    res.json({ user });
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
        email: z.string().trim().email().max(120),
      })
      .parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: {
        firstName,
        lastName,
        email,
        // Maintain `name` for read-compat in places that still consume it.
        name: `${firstName} ${lastName}`,
      },
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});
