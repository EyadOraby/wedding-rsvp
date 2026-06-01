import { prisma } from "@/lib/db";

export async function getAdminDashboardData() {
  const [guests, meals, dietary, settings, banking] = await Promise.all([
    prisma.rsvp.findMany({
      include: { mealOption: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.mealOption.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.dietaryOption.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.siteSettings.findUnique({ where: { id: "default" } }),
    prisma.bankingInfo.findUnique({ where: { id: "default" } }),
  ]);

  return {
    guests: guests.map((g) => ({
      ...g,
      createdAt: g.createdAt.toISOString(),
    })),
    meals,
    dietary,
    settings,
    banking,
  };
}
