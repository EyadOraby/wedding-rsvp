import { cache } from "react";
import { prisma } from "@/lib/db";

/** Cached per request so the page and its metadata share one set of queries. */
export const getPublicSiteData = cache(async () => {
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
});
