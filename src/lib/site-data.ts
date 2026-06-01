import { prisma } from "@/lib/db";

export async function getPublicSiteData() {
  const [settings, meals, dietary, banking] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "default" } }),
    prisma.mealOption.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.dietaryOption.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.bankingInfo.findUnique({ where: { id: "default" } }),
  ]);

  return {
    settings,
    meals,
    dietary,
    banking: banking?.active ? banking : null,
  };
}
