# RSVP builder: workflow

This project is growing from a single wedding site into an **RSVP builder**: anyone can sign up, pick a template and a design, choose the sections they want, fill in their details and publish an RSVP page. Every event gets its own dashboard with the responses.

This file is the plan and the progress log. It is updated in every phase, so it always says where work stands.

## Resuming on another machine

```bash
git fetch origin
git checkout <branch of the last phase marked done below>
npm ci
```

Then read the status table, set up `.env` (see the README), and continue with the first phase that is not done.

## Conventions

- **One phase per branch and pull request.** Branches are stacked: each PR targets the branch of the phase before it, so it shows only its own changes. Merge them in order.
- **Branch names:** `type/short-kebab` (`feat/`, `fix/`, `refactor/`, `docs/`, `test/`, `chore/`, `ci/`).
- **Commits:** short and specific, authored by `Eyad Oraby <118733038+EyadOraby@users.noreply.github.com>`.
- **Definition of done for a phase:** all of these pass locally, and the feature has been tried in the browser:

  ```bash
  npm run format:check && npm run lint && npm run typecheck && npm test && npm run build
  ```

- The app must build and run at the end of every phase. (The old single-wedding site kept working until phase 7 replaced it.)

## Phases

| #   | Branch                              | Scope                                                                                                                                                                     | Status      |
| --- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1   | `docs/builder-workflow`             | This plan, [architecture](ARCHITECTURE.md), [deployment notes](DEPLOYMENT.md)                                                                                             | Done        |
| 2   | `feat/event-data-model`             | `User`, `Event`, `Reply` models; event content schema (details, theme, sections, RSVP questions); templates; themes; answer validation; stats and CSV helpers; unit tests | Done        |
| 3   | `feat/user-accounts`                | Sign up, log in, log out; per-user sessions; protected `/dashboard`; event list                                                                                           | Done        |
| 4   | `feat/public-event-page`            | `/e/[slug]` rendered from the content schema; themes; sections; dynamic RSVP form and API; add-to-calendar file                                                           | Done        |
| 5   | `feat/event-builder`                | Create an event from a template; builder with live preview (details, design, sections, RSVP form, publish)                                                                | Done        |
| 6   | `feat/event-dashboard`              | Headcount stats, per-question breakdowns, searchable responses table, delete, CSV export, share link                                                                      | Done        |
| 7   | `refactor/remove-single-event-site` | Builder landing page at `/`; remove the old single-wedding site, admin and models; demo seed; README                                                                      | Done        |
| 8   | Deploy                              | Vercel + Neon, following [DEPLOYMENT.md](DEPLOYMENT.md) (needs the owner's accounts)                                                                                      | Not started |

## Round 2: polish and launch

A review of the finished builder found these weak spots. Each one is fixed in the phase shown.

| Weak spot                                                  | Fix                                                          | Phase |
| ---------------------------------------------------------- | ------------------------------------------------------------ | ----- |
| Default Next.js favicon and leftover starter images        | App icon and logo; unused files removed                      | 9     |
| Unstyled 404 and error pages                               | Branded not-found, event not-found and error pages           | 9     |
| No security headers                                        | `nosniff`, frame blocking, referrer and permissions policies | 9     |
| Schema is not applied when Vercel builds                   | `vercel-build` runs `prisma db push` before the build        | 9     |
| Only five looks, all with the same centred hero            | More themes, hero layouts and one-click design presets       | 10    |
| Only five event types                                      | More templates                                               | 10    |
| Leaving the builder with the back link loses unsaved work  | Ask before leaving                                           | 11    |
| Dashboard cards show no date, headcount or look            | Richer event cards                                           | 11    |
| Shared links show no preview in chat apps                  | Open Graph image per event                                   | 12    |
| Printed invitations have no way to link to the page        | QR code in the share panel                                   | 12    |
| Public form has rate limits but no bot trap                | Hidden honeypot field                                        | 12    |
| Hosts cannot change their password or delete their account | Account settings                                             | 13    |
| A similar event has to be built from scratch               | Duplicate an event                                           | 13    |

| #   | Branch                    | Scope                                                                          | Status      |
| --- | ------------------------- | ------------------------------------------------------------------------------ | ----------- |
| 9   | `chore/deploy-ready`      | Build script for Vercel, security headers, icon, error pages, round 2 plan     | Done        |
| 10  | `feat/themes-and-layouts` | New themes and fonts, hero layouts, design presets, new templates              | Done        |
| 11  | `feat/ui-polish`          | App shell and logo, dashboard cards, builder leave guard, landing page gallery | Not started |
| 12  | `feat/share-and-protect`  | Open Graph images, QR code, honeypot                                           | Not started |
| 13  | `feat/account-settings`   | Change name and password, delete account, duplicate event                      | Not started |

Phase 8 (deploy) runs alongside: the site is connected to Vercel, so every merge to `main` deploys and every PR gets a preview URL.

## Backlog

Ideas that are out of scope for the phases above:

- Guests can edit their reply from a private link
- Email confirmations to guests and new-reply alerts to hosts
- Invite lists with a personal link per guest and response rate
- Image uploads instead of image URLs
- Duplicate an event; event co-hosts
- Translations and right-to-left layouts
