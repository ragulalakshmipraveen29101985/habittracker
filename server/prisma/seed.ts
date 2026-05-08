// CLI seed: creates a demo user (+919999900001) and (re)seeds sample trackers.
// Usage: npm run seed

import { PrismaClient } from "@prisma/client";
import { seedTrackersForUser } from "../src/sampleSeed.js";

const prisma = new PrismaClient();

async function main() {
  const phone = "+919999900001";
  let user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({ data: { phone, name: "Demo Friend" } });
  }
  // wipe existing trackers for the demo user, then re-seed
  await prisma.tracker.deleteMany({ where: { userId: user.id } });
  await seedTrackersForUser(user.id);

  console.log(
    `\nSeeded demo user phone=${phone} name="${user.name}" with sample trackers.`,
  );
  console.log(
    `Login locally with phone "${phone}" and OTP from server console / response.\n`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
