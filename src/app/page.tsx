import Link from "next/link";
import { Logo } from "@/components/app/Logo";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EVENT_TYPES } from "@/lib/events/content";
import { DESIGN_PRESETS } from "@/lib/events/presets";
import { TEMPLATES } from "@/lib/events/templates";
import { readableOn, THEMES, titleFont, type Theme } from "@/lib/events/themes";

const DEMO_SLUG = "demo-wedding";

const FEATURES = [
  {
    title: "Ten templates",
    text: "Weddings, engagements, birthdays, dinners, graduations, meetups and more, each with sections and questions that fit.",
  },
  {
    title: "Designs with taste",
    text: "Ten themes, three hero layouts, your own accent colour and a cover photo, or start from a ready-made look.",
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
  ["Pick a template", "Start from one of ten event types."],
  ["Make it yours", "Choose a look, your sections and what to ask."],
  [
    "Share one link",
    "Guests reply on any device; you watch the dashboard fill up.",
  ],
];

function MiniHero({
  theme,
  accent,
  title,
  kicker,
}: {
  theme: Theme;
  accent?: string;
  title: string;
  kicker: string;
}) {
  return (
    <div
      className="flex h-36 flex-col items-center justify-center px-3 text-center"
      style={{ background: theme.colors.background, color: theme.colors.text }}
    >
      <span className="text-[9px] uppercase tracking-[0.3em] opacity-70">
        {kicker}
      </span>
      <span
        className="mt-1 text-2xl"
        style={{
          fontFamily: titleFont(theme),
          textTransform: theme.upperTitle ? "uppercase" : undefined,
          letterSpacing: theme.upperTitle ? "0.1em" : undefined,
        }}
      >
        {title}
      </span>
      <span
        className="mt-3 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]"
        style={{
          background: accent || theme.colors.accent,
          color: readableOn(accent || theme.colors.accent),
        }}
      >
        RSVP
      </span>
    </div>
  );
}

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
  const start = signedIn ? "/dashboard/new" : "/signup";

  return (
    <div className="app">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
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
            <p className="text-sm font-medium text-stone-500">
              Free RSVP pages for any event
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              RSVP pages your guests will enjoy using
            </h1>
            <p className="mt-5 max-w-xl text-lg text-stone-600">
              Pick a template and a look, choose your sections and questions,
              and share one link. Replies land in a dashboard with headcounts,
              meal counts and a CSV export.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={start} className="app-button px-5 py-3">
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
            <p className="mt-4 text-sm text-stone-500">
              No app for guests to install. Free and open source.
            </p>
          </div>

          <div aria-hidden="true" className="relative mx-auto w-full max-w-md">
            <div className="absolute -right-4 -top-6 hidden w-40 rotate-6 overflow-hidden rounded-xl border border-stone-200 shadow-lg sm:block">
              <MiniHero
                theme={THEMES.deco}
                title="Mona & Adel"
                kicker="25 years of"
              />
            </div>
            <div
              className="relative rounded-2xl border border-stone-200 p-8 text-center shadow-xl"
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
                  "Yes, I'll be there",
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
                className="mt-6 inline-block rounded-full px-6 py-2 font-serif text-xs uppercase tracking-[0.2em]"
                style={{ background: THEMES.classic.colors.accent, color: readableOn(THEMES.classic.colors.accent) }}
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
              Design inspirations
            </h2>
            <p className="mt-1 text-stone-600">
              Start from a ready-made look, then make it yours.
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {DESIGN_PRESETS.slice(0, 8).map((preset) => (
                <li
                  key={preset.name}
                  className="overflow-hidden rounded-xl border border-stone-200"
                >
                  <MiniHero
                    theme={THEMES[preset.theme.id]}
                    accent={preset.theme.accent}
                    title="Layla & Omar"
                    kicker="Join us"
                  />
                  <div className="p-3">
                    <p className="text-sm font-medium">{preset.name}</p>
                    <p className="text-xs text-stone-500">{preset.mood}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            A template for every occasion
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {EVENT_TYPES.map((type) => {
              const template = TEMPLATES[type];
              const theme = THEMES[template.content.theme.id];
              return (
                <li
                  key={type}
                  className="overflow-hidden rounded-xl border border-stone-200 bg-white"
                >
                  <div
                    className="flex h-20 items-center justify-center px-2 text-center"
                    style={{
                      background: theme.colors.background,
                      color: theme.colors.text,
                    }}
                  >
                    <span
                      className="text-lg"
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
                  <p className="p-3 text-sm font-medium">{template.label}</p>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="border-t border-stone-200 bg-white py-16">
          <div className="mx-auto max-w-6xl px-4">
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
              href={start}
              className="mt-10 inline-flex rounded-lg bg-white px-5 py-3 text-sm font-medium text-stone-900 hover:bg-stone-200"
            >
              Create your event
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-stone-500">
        <Logo />
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
