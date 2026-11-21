/**
 * Starting content for your wedding site.
 *
 * `npm run db:seed` copies these values into the database, and the home page
 * falls back to them until site settings exist. After seeding, change
 * everything from the /admin dashboard instead of editing this file.
 */
export const weddingDefaults = {
  site: {
    initials: "A & S",
    coupleNames: "ALEX & SAM",
    weddingDate: "SATURDAY, JUNE 12, 2027",
    location: "CAIRO, EGYPT",
    heroImageUrl: null,
    rsvpHeading: "RSVP",
    bankingHeading: "GIFTING",
  },
  meals: [
    {
      title: "Herb-roasted chicken",
      description: "Lemon and thyme chicken with roasted potatoes and greens.",
      tag: null,
    },
    {
      title: "Grilled sea bass",
      description:
        "Sea bass with saffron rice, charred vegetables and salsa verde.",
      tag: null,
    },
    {
      title: "Wild mushroom risotto",
      description:
        "Creamy arborio rice with mushrooms, parmesan and truffle oil.",
      tag: "V",
    },
  ],
  dietary: [
    "Vegetarian",
    "Vegan",
    "Halal",
    "Kosher",
    "Gluten free",
    "Nut allergy",
  ],
  banking: {
    accountName: "Alex & Sam",
    bankName: "Your bank name",
    accountNumber: "0000000000",
    branchCode: "000000",
    notes: "Please use your name as the payment reference.",
    active: true,
  },
};
