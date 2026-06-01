# Set up Vercel Postgres for Wedding RSVP

Follow these steps in order. You need a free [Vercel](https://vercel.com) account.

---

## Part 1 — Deploy the app (if you haven’t yet)

1. Push the project to GitHub:
   ```bash
   cd ~/wedding-rsvp
   git add .
   git commit -m "Wedding RSVP site"
   ```
   Create a repo on GitHub, then:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/wedding-rsvp.git
   git push -u origin main
   ```

2. Open **[vercel.com/new](https://vercel.com/new)** and click **Import** next to your `wedding-rsvp` repo.

3. Before deploying, add one environment variable:
   - **Name:** `ADMIN_PASSWORD`
   - **Value:** a strong password you’ll use at `/admin`

4. Click **Deploy** and wait until the build finishes (it may fail without a database — that’s OK for now).

---

## Part 2 — Create Vercel Postgres

1. Open your project on Vercel (click the project name from the dashboard).

2. Go to the **Storage** tab (top navigation).

3. Click **Create Database**.

4. Choose **Postgres** (powered by Neon).

5. Name it something like `wedding-rsvp-db` and pick a region close to you (e.g. Washington D.C. or Frankfurt).

6. Click **Create**.

7. When asked **“Connect to a project?”**, select your **wedding-rsvp** project and check:
   - **Production**
   - **Preview**
   - **Development** (optional but useful)

8. Click **Connect**.

Vercel will add these variables to your project automatically:

| Variable | Used for |
|----------|----------|
| `POSTGRES_PRISMA_URL` | App queries (Prisma) |
| `POSTGRES_URL_NON_POOLING` | Migrations / `db push` |
| `POSTGRES_URL` | General connection |

You do **not** need to create `DATABASE_URL` manually.

---

## Part 3 — Redeploy

1. Go to **Deployments** → open the latest deployment → **⋯** → **Redeploy**.

   Or push any small change to GitHub to trigger a new deploy.

2. The site should load without database errors after tables exist (Part 4).

---

## Part 4 — Create tables (one time)

### Option A — From your Mac (recommended)

1. Install Vercel CLI and log in:
   ```bash
   npm i -g vercel
   cd ~/wedding-rsvp
   vercel login
   vercel link
   ```
   Choose your Vercel team and the `wedding-rsvp` project.

2. Download production env vars:
   ```bash
   vercel env pull .env.local
   ```

3. Run migrations and seed:
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. Test locally:
   ```bash
   cp .env.local .env
   npm run dev
   ```

### Option B — Copy env vars by hand

1. Vercel project → **Storage** → your Postgres database.

2. Open the **`.env.local`** tab and copy the values.

3. Paste into `~/wedding-rsvp/.env`:
   ```
   POSTGRES_PRISMA_URL="..."
   POSTGRES_URL_NON_POOLING="..."
   ADMIN_PASSWORD="your-admin-password"
   ```

4. Run:
   ```bash
   cd ~/wedding-rsvp
   npm run db:push
   npm run db:seed
   ```

---

## Part 5 — Verify

| Check | URL |
|-------|-----|
| RSVP page | `https://your-project.vercel.app` |
| Admin | `https://your-project.vercel.app/admin` |

Submit a test RSVP on the live site, then open the admin dashboard and confirm the guest appears under **Guests**.

---

## Troubleshooting

**Build fails with “environment variable not found”**  
→ Postgres must be **connected** to the same Vercel project. Storage → database → **Connect Project**.

**`db push` fails locally**  
→ Use `POSTGRES_URL_NON_POOLING` in `.env` (not only the pooled URL). `vercel env pull` includes both.

**Admin login doesn’t work**  
→ Set `ADMIN_PASSWORD` under **Settings → Environment Variables**, then redeploy.

**RSVP submits but nothing in admin**  
→ Run `npm run db:push` and `npm run db:seed` against the **production** database (Part 4).

---

## Quick reference

```bash
# Link project & pull DB credentials from Vercel
vercel link
vercel env pull .env.local

# Create tables + default meals/dietary options
npm run db:push
npm run db:seed
```
