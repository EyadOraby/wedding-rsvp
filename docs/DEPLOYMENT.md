# Deployment

## Recommended free setup

| Need        | Service                                 | Why                                                                                                                     |
| ----------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| App hosting | [Vercel](https://vercel.com) Hobby plan | Made for Next.js; deploys every push, gives every PR a preview URL, free HTTPS and a `*.vercel.app` domain              |
| Database    | [Neon](https://neon.tech) free plan     | Serverless Postgres; pauses when idle and wakes on the next request, so a portfolio demo stays available without paying |

The same pair works for most portfolio web projects. For static sites and Flutter web builds, Cloudflare Pages or GitHub Pages are free with no sleep or cold start.

Things to know before relying on free plans:

- Vercel's Hobby plan is for personal, non-commercial use. A portfolio demo is fine; a site you run for a paying client should move to a paid plan or the client's own account.
- Free databases have small storage limits and may pause when idle, so the first request after a quiet period is slower.
- Free plan limits change; check the current pricing pages before committing to one.

## Steps

1. **Import the repository** at [vercel.com/new](https://vercel.com/new) (sign in with GitHub). The framework is detected as Next.js; keep the defaults.
2. **Add the database:** in the Vercel project, open **Storage → Create Database → Neon** and connect it to the project. This creates a free Neon database and sets `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING` and related variables for you.
3. **Add the session secret** in **Settings → Environment Variables**:

   | Name                   | Value                                                         |
   | ---------------------- | ------------------------------------------------------------- |
   | `SESSION_SECRET`       | 32+ random characters (`openssl rand -base64 48`)             |
   | `NEXT_PUBLIC_SITE_URL` | Optional: your custom domain, e.g. `https://rsvp.example.com` |

4. **Deploy** (Deployments → Redeploy, or push to `main`). The `vercel-build` script runs `prisma db push` before building, so the tables are created on the first deploy and kept in step with the schema afterwards. A change that would drop data stops the build instead of running.
5. **Optional demo data:** to show a sample event on the landing page, run the seed against the production database once from your machine:

   ```bash
   npx vercel env pull .env.production.local
   npx tsx --env-file=.env.production.local prisma/seed.ts
   ```

   Or sign up on the live site and create a real example event.

Every push to `main` redeploys, and every pull request gets its own preview URL.

## Showcasing to clients

- Add a demo event with sample replies so the dashboard has something to show. `npm run db:seed` creates one locally; run it against a separate demo database rather than real data.
- Put the live URL and a few screenshots in the README and in your portfolio.
- A custom domain can be added in Vercel for free if you already own the domain.
