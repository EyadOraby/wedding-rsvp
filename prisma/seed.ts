import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      initials: "J & Y",
      coupleNames: "JORDAN & YOSSEF",
      weddingDate: "NOVEMBER 21, 2026",
      location: "FRANSCHHOEK, SOUTH AFRICA",
      rsvpHeading: "RSVP",
      bankingHeading: "GIFTING",
    },
  });

  await prisma.bankingInfo.upsert({
    where: { id: "default" },
    update: {},
    create: {
      accountName: "Jordan & Yossef",
      bankName: "Your Bank Name",
      accountNumber: "0000000000",
      branchCode: "000000",
      notes: "Please use your name as the payment reference.",
      active: true,
    },
  });

  const meals = [
    {
      title: "Fresh Cape line fish",
      description:
        "Garlic bay chili velouté, crispy potatoes, lemony charred greens and salsa verde oil.",
      sortOrder: 0,
    },
    {
      title: "Middle Eastern melanzane",
      description:
        "Tahini, sumac onion, parsley, crispy potatoes, lemony charred greens and salsa verde oil.",
      tag: "VG",
      sortOrder: 1,
    },
  ];

  for (const meal of meals) {
    const existing = await prisma.mealOption.findFirst({
      where: { title: meal.title },
    });
    if (!existing) {
      await prisma.mealOption.create({ data: meal });
    }
  }

  const dietary = [
    "Vegetarian",
    "Vegan",
    "Halal",
    "Kosher",
    "Gluten free",
    "Nut allergy",
  ];

  for (let i = 0; i < dietary.length; i++) {
    const label = dietary[i];
    const existing = await prisma.dietaryOption.findFirst({ where: { label } });
    if (!existing) {
      await prisma.dietaryOption.create({
        data: { label, sortOrder: i },
      });
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
