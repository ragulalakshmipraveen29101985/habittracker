import bcrypt from "bcryptjs";
import { prisma } from "../db.js";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_PER_HOUR = 5;

export function generateCode(): string {
  // 6-digit zero-padded
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function createOtp(phone: string): Promise<{ code: string }> {
  // Rate limit: count requests in last hour
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await prisma.otpCode.count({
    where: { phone, createdAt: { gte: since } },
  });
  if (recent >= RATE_LIMIT_PER_HOUR) {
    throw Object.assign(new Error("Too many OTP requests. Please wait."), {
      status: 429,
    });
  }

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 8);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  await prisma.otpCode.create({
    data: { phone, codeHash, expiresAt },
  });
  return { code };
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const otp = await prisma.otpCode.findFirst({
    where: { phone, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return false;
  if (otp.attempts >= MAX_ATTEMPTS) {
    throw Object.assign(new Error("Too many attempts. Request a new code."), {
      status: 410,
    });
  }
  const ok = await bcrypt.compare(code, otp.codeHash);
  if (!ok) {
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    return false;
  }
  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { consumedAt: new Date() },
  });
  return true;
}
