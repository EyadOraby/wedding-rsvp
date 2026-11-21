# Architecture

Next.js (App Router) with route handlers, Prisma on PostgreSQL, zod for every input, Tailwind CSS for styling, Vitest for tests.

## Data model

```
User 1 ── * Event 1 ── * Reply
```

| Model   | Key fields                                                                             |
| ------- | -------------------------------------------------------------------------------------- |
| `User`  | `email` (unique), `name`, `passwordHash` (scrypt)                                      |
| `Event` | `ownerId`, `slug` (unique, public URL), `type`, `title`, `published`, `content` (JSON) |
| `Reply` | `eventId`, `name`, `email`, `attending`, `guestCount`, `message`, `answers` (JSON)     |

Columns hold what is queried or listed. Everything about how the page looks and what it asks lives in `Event.content`, validated by one zod schema (`src/lib/events/content.ts`) on every write and on every read. The schema has a `version` field so it can be migrated later.

## Event content

```ts
{
  version: 1,
  details: { headline, hosts, date, time, venue, address, mapUrl, heroImageUrl, intro },
  theme:   { id: "classic" | "garden" | "midnight" | "modern" | "sunset", accent? },
  sections: Section[],   // ordered; the order on the page
  rsvp:    { deadline, allowPlusOnes, maxGuests, collectEmail, questions, thankYouMessage },
}
```

**Sections** are a discriminated union on `type`. Each has an `id`, `enabled` and a `title`:

| Type        | Content                                                          |
| ----------- | ---------------------------------------------------------------- |
| `story`     | free text                                                        |
| `schedule`  | list of `{ time, label, note }`                                  |
| `location`  | note; uses the venue, address and map link from details          |
| `countdown` | uses the event date                                              |
| `dressCode` | free text                                                        |
| `gifts`     | text plus `{ label, value }` rows (bank details, registry links) |
| `faq`       | list of `{ question, answer }`                                   |
| `rsvp`      | the RSVP form; always enabled, but can be moved                  |

The hero (headline, hosts, date, venue, image) is always first.

**RSVP questions** replace the old fixed meal and dietary fields:

| Type               | Answer stored as                                   |
| ------------------ | -------------------------------------------------- |
| `single`           | option id                                          |
| `multi`            | option ids, plus free text when `allowOther` is on |
| `yesno`            | boolean                                            |
| `text`, `longtext` | string                                             |

Each question has `required` and `showWhen` (`always` or `attending`). The reply schema is built from the event's questions at request time (`src/lib/events/answers.ts`), so a reply can only contain answers to questions that exist, with valid option ids.

**Templates** (`src/lib/events/templates.ts`) give each event type a starting point: wedding, birthday, party, baby shower and corporate. **Themes** (`src/lib/events/themes.ts`) are sets of CSS variables and font choices; the host can override the accent colour.

## Routes

| Path                          | What it is                                                   |
| ----------------------------- | ------------------------------------------------------------ |
| `/`                           | Landing page for the builder                                 |
| `/signup`, `/login`           | Accounts                                                     |
| `/dashboard`                  | The signed-in user's events                                  |
| `/dashboard/new`              | Pick a template; creates a draft event                       |
| `/dashboard/events/[id]`      | Event dashboard: stats, breakdowns, responses, export, share |
| `/dashboard/events/[id]/edit` | Builder with live preview                                    |
| `/e/[slug]`                   | Public event page with the RSVP form                         |
| `/e/[slug]/calendar`          | `.ics` file for the event                                    |

API route handlers live under `/api/auth`, `/api/events` (owner only) and `/api/e/[slug]/rsvp` (public).

## Rendering

`EventPageView` renders an event from its content and has no server-only imports. The public page renders it on the server, and the builder renders the same component with the unsaved draft, so the preview always matches the real page.

## Security

- Passwords are hashed with scrypt and a random salt; comparisons run in constant time.
- Sessions are signed JWTs (HS256, `SESSION_SECRET`) in an `httpOnly`, `sameSite=lax` cookie.
- The proxy blocks cross-origin writes and redirects signed-out users away from `/dashboard`. Every owner route handler also checks the session and that the event belongs to the user.
- Sign up, log in and RSVP submissions are rate-limited per IP.
- Unpublished events return 404 to the public. Event pages are not indexed by search engines.
- CSV export guards against spreadsheet formula injection.

## Tests

Unit tests cover the content schema, templates, answer validation, stats, CSV, slugs, passwords and sessions. Route handler tests run with Prisma mocked. CI runs format, lint, typecheck, tests and a production build on every pull request.
