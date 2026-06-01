# Wedding RSVP

A minimalist wedding RSVP site with meal selection, dietary requirements, banking details, and an admin dashboard. Built with **Next.js** and designed for free hosting on **Vercel**.

## Features

- **Landing page** (`/`) — elegant cream-and-serif design inspired by classic wedding sites
- **RSVP form** — attending / declining, meal choice, dietary checkboxes, optional message
- **Gifting section** — bank details for guests (editable in admin)
- **Admin dashboard** (`/admin`) — guest list, meal & dietary options, banking & site settings

## Local development

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the database

Create a free PostgreSQL database (any of these work):

- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (recommended when deploying to Vercel)
- [Neon](https://neon.tech) (free tier)
- [Supabase](https://supabase.com) (free tier)

Copy the example env file and add your connection string and admin password:

```bash
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URL="postgresql://..."
ADMIN_PASSWORD="your-secret-password"
```

### 3. Create tables and seed data

```bash
npm run db:push
npm run db:seed
```

### 4. Run the dev server

```bash
npm run dev
```

- RSVP site: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin) (use `ADMIN_PASSWORD`)

## Deploy to Vercel (free)

Both the public site and admin dashboard deploy together as one Next.js app.

### 1. Push to GitHub

```bash
git init   # if not already
git add .
git commit -m "Initial wedding RSVP site"
git remote add origin https://github.com/YOUR_USER/wedding-rsvp.git
git push -u origin main
```

### 2. Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework preset: **Next.js** (auto-detected)

### 3. Add Postgres storage

1. In your Vercel project → **Storage** → **Create Database** → **Postgres**
2. Connect it to the project — Vercel sets `DATABASE_URL` automatically

### 4. Add environment variables

In **Project Settings → Environment Variables**, add:

| Name | Value |
|------|--------|
| `DATABASE_URL` | (auto-set if using Vercel Postgres) |
| `ADMIN_PASSWORD` | A strong password for `/admin` |

### 5. Deploy and initialize the database

After the first deploy, run these once from your machine (with `DATABASE_URL` pointing to production, or use Vercel CLI):

```bash
npx vercel env pull .env.production
npx prisma db push
npx prisma db seed
```

Or add a **Build Command** override in Vercel (optional, for migrations on each deploy):

```
npx prisma db push && npm run build
```

### 6. Your live URLs

- **RSVP page:** `https://your-project.vercel.app`
- **Admin:** `https://your-project.vercel.app/admin`

## Customization

Use the admin dashboard (**Site** tab) to update:

- Couple initials and names
- Wedding date and location
- Hero image URL
- Section headings

Use **Meals**, **Dietary**, and **Banking** tabs to add, hide, or remove options without code changes.

## Tech stack

- [Next.js](https://nextjs.org) (App Router)
- [Tailwind CSS](https://tailwindcss.com)
- [Prisma](https://www.prisma.io) + PostgreSQL
- [Vercel](https://vercel.com) hosting
