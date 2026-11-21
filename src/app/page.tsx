import Link from "next/link";
import { APP_NAME } from "@/config/app";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EVENT_TYPES } from "@/lib/events/content";
import { TEMPLATES } from "@/lib/events/templates";
import { THEMES, titleFont } from "@/lib/events/themes";

const DEMO_SLUG = "demo-wedding";

const FEATURES = [
  {
    title: "Templates for any event",
    text: "Weddings, birthdays, parties, baby showers and company events, each with sensible sections and questions to start from.",
  },
  {
    title: "Your design, your sections",
    text: "Five themes, your own accent colour, a cover photo, and sections you can show, hide and reorder.",
  },
  {
    title: "Ask what you need",
    text: "Meal choices, dietary needs, song requests, yes/no questions: build the RSVP form question by question.",
  },
  {
    title: "Live preview",
    text: "See the page exactly as guests will, on desktop or phone, while you edit.",
  },
  {
    title: "A dashboard per event",
    text: "Headcount, who is coming, answer breakdowns and every reply in a searchable table.",
  },
  {
    title: "Export and calendar",
    text: "Download replies as CSV for the caterer, and give guests an add-to-calendar file.",
  },
];

const STEPS = [
  [
    "Pick a template",
    "Start from a wedding, birthday, party, baby shower or corporate event.",
  ],
  ["Make it yours", "Add your details, choose a theme and decide what to ask."],
  [
    "Share one link",
    "Guests reply on any device; you watch the dashboard fill up.",
  ],
];

/** Shows the example link only when the demo seed has been run. */
async function hasDemo(): Promise<boolean> {
  try {
    const demo = await prisma.event.findUnique({
      where: { slug: DEMO_SLUG },
      select: { published: true },
    });
    return Boolean(demo?.published);
  } catch {
    return false;
  }
}

export default async function HomePage() {
  const [signedIn, demo] = await Promise.all([getSessionUserId(), hasDemo()]);

  return (
    <div className="app">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <span className="font-semibold tracking-tight">{APP_NAME}</span>
        <nav className="flex items-center gap-3 text-sm">
          {signedIn ? (
            <Link href="/dashboard" className="app-button">
              Your events
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-stone-600 hover:text-stone-900"
              >
                Log in
              </Link>
              <Link href="/signup" className="app-button">
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-12 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              RSVP pages your guests will enjoy using
            </h1>
            <p className="mt-5 max-w-xl text-lg text-stone-600">
              Pick a template, choose your sections and questions, and share one
              link. Replies land in a dashboard with headcounts, meal counts and
              a CSV export.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={signedIn ? "/dashboard/new" : "/signup"}
                className="app-button px-5 py-3"
              >
                Create your event
              </Link>
              {demo && (
                <Link
                  href={`/e/${DEMO_SLUG}`}
                  className="app-button-secondary px-5 py-3"
                >
                  See an example
                </Link>
              )}
            </div>
            <p className="mt-4 text-sm text-stone-500">Free and open source.</p>
          </div>

          <div aria-hidden="true" className="relative mx-auto w-full max-w-md">
            <div
              className="rounded-2xl border border-stone-200 p-8 text-center shadow-xl"
              style={{
                background: THEMES.classic.colors.background,
                color: THEMES.classic.colors.text,
              }}
            >
              <p className="text-[10px] uppercase tracking-[0.3em] opacity-70">
                The wedding of
              </p>
              <p className="mt-2 font-script text-5xl">Layla &amp; Omar</p>
              <p className="mt-4 font-serif text-xs uppercase tracking-[0.2em]">
                Saturday, June 12, 2027 · 4:00 PM
              </p>
              <div className="mx-auto mt-6 space-y-3 text-left font-serif text-sm">
                {[
                  "Joyfully attending",
                  "Meal: Fish",
                  "Dietary: Vegetarian",
                ].map((line) => (
                  <div
                    key={line}
                    className="rounded-md border border-stone-300 bg-white/60 px-3 py-2"
                  >
                    {line}
                  </div>
                ))}
              </div>
              <span
                className="mt-6 inline-block rounded-full px-6 py-2 font-serif text-xs uppercase tracking-[0.2em] text-white"
                style={{ background: THEMES.classic.colors.accent }}
              >
                Send reply
              </span>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-stone-200 bg-white p-4 shadow-lg sm:block">
              <p className="text-xs text-stone-500">Headcount</p>
              <p className="text-2xl font-semibold">84</p>
            </div>
          </div>
        </section>

        <section className="border-y border-stone-200 bg-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-2xl font-semibold tracking-tight">
              Start from a template
            </h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {EVENT_TYPES.map((type) => {
                const template = TEMPLATES[type];
                const theme = THEMES[template.content.theme.id];
                return (
                  <li
                    key={type}
                    className="overflow-hidden rounded-xl border border-stone-200"
                  >
                    <div
                      className="flex h-24 flex-col items-center justify-center px-2 text-center"
                      style={{
                        background: theme.colors.background,
                        color: theme.colors.text,
                      }}
                    >
                      <span
                        className="text-xl"
                        style={{
                          fontFamily: titleFont(theme),
                          textTransform: theme.upperTitle
                            ? "uppercase"
                            : undefined,
                        }}
                      >
                        {template.title}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium">{template.label}</p>
                      <p className="text-xs text-stone-500">
                        {theme.name} theme
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            Everything a host needs
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="app-card p-6">
                <h3 className="font-medium">{feature.title}</h3>
                <p className="mt-2 text-sm text-stone-600">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-stone-900 py-16 text-white">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-2xl font-semibold tracking-tight">
              How it works
            </h2>
            <ol className="mt-8 grid gap-8 sm:grid-cols-3">
              {STEPS.map(([title, text], i) => (
                <li key={title}>
                  <span className="text-sm text-stone-400">Step {i + 1}</span>
                  <p className="mt-1 font-medium">{title}</p>
                  <p className="mt-2 text-sm text-stone-300">{text}</p>
                </li>
              ))}
            </ol>
            <Link
              href={signedIn ? "/dashboard/new" : "/signup"}
              className="mt-10 inline-flex rounded-lg bg-white px-5 py-3 text-sm font-medium text-stone-900 hover:bg-stone-200"
            >
              Create your event
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-4 py-8 text-sm text-stone-500">
        <span>{APP_NAME}</span>
        <a
          href="https://github.com/EyadOraby/wedding-rsvp"
          className="hover:text-stone-900"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source on GitHub
        </a>
      </footer>
    </div>
  );
}
