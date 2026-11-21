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

- The app must build and run at the end of every phase. The old single-wedding site keeps working until phase 7 replaces it.

## Phases

| #   | Branch                              | Scope                                                                                                                                                                     | Status      |
| --- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1   | `docs/builder-workflow`             | This plan, [architecture](ARCHITECTURE.md), [deployment notes](DEPLOYMENT.md)                                                                                             | Done        |
| 2   | `feat/event-data-model`             | `User`, `Event`, `Reply` models; event content schema (details, theme, sections, RSVP questions); templates; themes; answer validation; stats and CSV helpers; unit tests | Done        |
| 3   | `feat/user-accounts`                | Sign up, log in, log out; per-user sessions; protected `/dashboard`; event list                                                                                           | Done        |
| 4   | `feat/public-event-page`            | `/e/[slug]` rendered from the content schema; themes; sections; dynamic RSVP form and API; add-to-calendar file                                                           | Done        |
| 5   | `feat/event-builder`                | Create an event from a template; builder with live preview (details, design, sections, RSVP form, publish)                                                                | Done        |
| 6   | `feat/event-dashboard`              | Headcount stats, per-question breakdowns, searchable responses table, delete, CSV export, share link                                                                      | Done        |
| 7   | `refactor/remove-single-event-site` | Builder landing page at `/`; remove the old single-wedding site, admin and models; demo seed; README                                                                      | Not started |
| 8   | Deploy                              | Vercel + Neon, following [DEPLOYMENT.md](DEPLOYMENT.md) (needs the owner's accounts)                                                                                      | Not started |

## Backlog

Ideas that are out of scope for the phases above:

- QR code for printed invitations
- Guests can edit their reply from a private link
- Email confirmations to guests and new-reply alerts to hosts
- Invite lists with a personal link per guest and response rate
- Image uploads instead of image URLs
- Duplicate an event; event co-hosts
- Translations and right-to-left layouts
