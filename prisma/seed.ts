import "dotenv/config";
import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";
import { buildFromTemplate } from "../src/lib/events/templates";

/**
 * Creates a demo host with a published wedding and sample replies, so the
 * builder and dashboard have something to show. Safe to run again: it
 * replaces the demo host's events each time.
 */

const prisma = new PrismaClient();

const DEMO_EMAIL = process.env.DEMO_EMAIL || "demo@example.com";
const DEMO_SLUG = "demo-wedding";

async function main() {
  const password =
    process.env.DEMO_PASSWORD || randomBytes(9).toString("base64url");
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { passwordHash: await hashPassword(password) },
    create: {
      email: DEMO_EMAIL,
      name: "Demo Host",
      passwordHash: await hashPassword(password),
    },
  });
  await prisma.event.deleteMany({ where: { ownerId: user.id } });

  const wedding = buildFromTemplate("wedding");
  const content = wedding.content;
  Object.assign(content.details, {
    date: "2027-06-12",
    venue: "The Olive Garden Estate",
    address: "El Mansoureya Road, Giza",
    intro: "We would love for you to celebrate with us.",
  });
  content.rsvp.deadline = "2027-05-01";
  const story = content.sections.find((s) => s.type === "story");
  if (story?.type === "story") {
    story.body =
      "We met at a friend's birthday dinner in 2019 and have not stopped talking since.\nWe can't wait to celebrate with the people we love most.";
  }

  const event = await prisma.event.create({
    data: {
      ownerId: user.id,
      slug: DEMO_SLUG,
      type: "wedding",
      title: "Layla & Omar",
      published: true,
      content,
    },
  });

  const replies = [
    {
      name: "Sara Ahmed",
      email: "sara@example.com",
      attending: true,
      guestCount: 2,
      answers: { q_meal: "opt_2", q_dietary: ["opt_1"], q_song: "September" },
      message: "So happy for you both!",
    },
    {
      name: "Karim Mostafa",
      email: null,
      attending: true,
      guestCount: 1,
      answers: { q_meal: "opt_1", q_song: "Dancing Queen" },
      message: null,
    },
    {
      name: "Nour Hassan",
      email: "nour@example.com",
      attending: true,
      guestCount: 2,
      answers: { q_meal: "opt_3", q_dietary: ["opt_2", "opt_6"] },
      message: null,
    },
    {
      name: "Youssef Ali",
      email: null,
      attending: true,
      guestCount: 1,
      answers: { q_meal: "opt_1", q_dietary: ["opt_3"] },
      message: "See you there",
    },
    {
      name: "Mariam Fathy",
      email: "mariam@example.com",
      attending: true,
      guestCount: 2,
      answers: { q_meal: "opt_2", q_dietary__other: "No shellfish" },
      message: null,
    },
    {
      name: "Hana Samir",
      email: null,
      attending: false,
      guestCount: 0,
      answers: {},
      message: "Sorry to miss it, sending love.",
    },
  ];
  await prisma.reply.createMany({
    data: replies.map((reply) => ({ ...reply, eventId: event.id })),
  });

  const birthday = buildFromTemplate("birthday");
  await prisma.event.create({
    data: {
      ownerId: user.id,
      slug: "demo-birthday",
      type: "birthday",
      title: birthday.title,
      published: false,
      content: birthday.content,
    },
  });

  console.log(`Demo host: ${DEMO_EMAIL}`);
  console.log(
    process.env.DEMO_PASSWORD
      ? "Password: the DEMO_PASSWORD from your .env"
      : `Password: ${password} (set DEMO_PASSWORD in .env to choose one)`,
  );
  console.log(`Demo page: /e/${DEMO_SLUG}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
