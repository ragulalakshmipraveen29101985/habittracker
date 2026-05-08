-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT;

-- Backfill: existing users with a `name` value are treated as already-onboarded.
-- Copy `name` into `firstName` so they don't get re-prompted for profile info on next login.
UPDATE "User"
SET "firstName" = "name"
WHERE "firstName" IS NULL AND "name" IS NOT NULL;
