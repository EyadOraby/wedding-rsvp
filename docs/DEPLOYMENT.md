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

1. **Database:** create a Neon project. Copy the **pooled** connection string and the **direct** one.
2. **Vercel:** import the GitHub repository at [vercel.com/new](https://vercel.com/new). The framework is detected as Next.js.
3. **Environment variables** (Project Settings → Environment Variables):

   | Name                       | Value                                             |
   | -------------------------- | ------------------------------------------------- |
   | `POSTGRES_PRISMA_URL`      | Neon pooled connection string                     |
   | `POSTGRES_URL_NON_POOLING` | Neon direct connection string                     |
   | `SESSION_SECRET`           | 32+ random characters (`openssl rand -base64 48`) |

   Neon is also available from the Vercel Storage tab, which sets the two database variables for you.

4. **Create the tables** once, from your machine, with the production values in `.env`:

   ```bash
   npx prisma db push
   ```

5. **Deploy.** Every push to `main` redeploys; every pull request gets its own preview URL.

## Showcasing to clients

- Add a demo event with sample replies so the dashboard has something to show. `npm run db:seed` creates one locally; run it against a separate demo database rather than real data.
- Put the live URL and a few screenshots in the README and in your portfolio.
- A custom domain can be added in Vercel for free if you already own the domain.
