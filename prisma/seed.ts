import { PrismaClient } from "@prisma/client";
import { weddingDefaults } from "../src/config/wedding";

const prisma = new PrismaClient();

/** Idempotent: safe to run again; existing rows are left untouched. */
async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", ...weddingDefaults.site },
  });

  await prisma.bankingInfo.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", ...weddingDefaults.banking },
  });

  for (const [sortOrder, meal] of weddingDefaults.meals.entries()) {
    const existing = await prisma.mealOption.findFirst({
      where: { title: meal.title },
    });
    if (!existing) {
      await prisma.mealOption.create({ data: { ...meal, sortOrder } });
    }
  }

  for (const [sortOrder, label] of weddingDefaults.dietary.entries()) {
    const existing = await prisma.dietaryOption.findFirst({ where: { label } });
    if (!existing) {
      await prisma.dietaryOption.create({ data: { label, sortOrder } });
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
