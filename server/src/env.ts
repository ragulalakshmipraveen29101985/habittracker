import "dotenv/config";

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

const expiryRaw = process.env.JWT_EXPIRY_DAYS;
const expiryParsed = expiryRaw ? Number(expiryRaw) : 30;
const JWT_EXPIRY_DAYS =
  Number.isFinite(expiryParsed) && expiryParsed >= 1 && expiryParsed <= 3650
    ? Math.floor(expiryParsed)
    : 30;

export const env = {
  DATABASE_URL: required("DATABASE_URL"),
  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRY_DAYS,
  PORT: Number(process.env.PORT ?? 4000),
  NODE_ENV: (process.env.NODE_ENV ?? "development") as "development" | "production",
  isDev: (process.env.NODE_ENV ?? "development") === "development",
};
