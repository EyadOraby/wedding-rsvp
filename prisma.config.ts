import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  engine: "classic",
  datasource: {
    // Read directly (not with env()) so `prisma generate`, which runs on
    // install, works before a database is configured.
    url: process.env.POSTGRES_PRISMA_URL ?? "",
  },
});
