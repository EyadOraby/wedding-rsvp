import type { CSSProperties } from "react";
import type { EventContent, Section } from "@/lib/events/content";
import { formatEventDate, formatTime } from "@/lib/events/format";
import { themeVariables } from "@/lib/events/themes";
import { EventRsvpForm } from "./EventRsvpForm";
import {
  CountdownSection,
  DressCodeSection,
  FaqSection,
  GiftsSection,
  LocationSection,
  ScheduleSection,
  StorySection,
} from "./sections";

type Props = {
  title: string;
  content: EventContent;
  /** Public slug; leave out in the builder preview. */
  slug?: string;
  closed?: boolean;
  /** Shown above the page, e.g. to tell the owner it is still a draft. */
  notice?: React.ReactNode;
};

function SectionBody({ section, props }: { section: Section; props: Props }) {
  const { content } = props;
  switch (section.type) {
    case "story":
      return <StorySection section={section} />;
    case "schedule":
      return <ScheduleSection section={section} />;
    case "location":
      return <LocationSection section={section} details={content.details} />;
    case "countdown":
      return <CountdownSection section={section} date={content.details.date} />;
    case "dressCode":
      return <DressCodeSection section={section} />;
    case "gifts":
      return <GiftsSection section={section} />;
    case "faq":
      return <FaqSection section={section} />;
    case "rsvp":
      return (
        <EventRsvpForm
          title={props.title}
          content={content}
          slug={props.slug}
          closed={props.closed}
        />
      );
  }
}

/**
 * The whole public event page. It has no server-only code, so the builder
 * renders the same component for its live preview.
 */
export function EventPageView(props: Props) {
  const { title, content, slug, notice } = props;
  const { details } = content;
  const when = [formatEventDate(details.date), formatTime(details.time)]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className="ev min-h-full"
      style={themeVariables(content.theme) as CSSProperties}
    >
      {notice}
      <header className="px-6 pb-16 pt-14 text-center">
        {details.heroImageUrl && (
          // Hosts paste images from any site, which next/image cannot allow-list.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={details.heroImageUrl}
            alt=""
            className="mx-auto mb-10 aspect-[16/9] w-full max-w-3xl rounded-2xl object-cover"
          />
        )}
        {details.headline && <p className="ev-kicker">{details.headline}</p>}
        <h1 className="ev-title mt-4 break-words text-5xl leading-tight sm:text-7xl">
          {title}
        </h1>
        {when && (
          <p className="mt-6 text-sm tracking-[0.2em] uppercase">{when}</p>
        )}
        {details.venue && <p className="ev-muted mt-2">{details.venue}</p>}
        {details.intro && (
          <p className="mx-auto mt-8 max-w-xl whitespace-pre-line leading-relaxed">
            {details.intro}
          </p>
        )}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a href="#rsvp" className="ev-button">
            RSVP
          </a>
          {slug && details.date && (
            <a href={`/e/${slug}/calendar`} className="ev-link text-sm">
              Add to calendar
            </a>
          )}
        </div>
      </header>

      {content.sections
        .filter((section) => section.enabled)
        .map((section) => (
          <section
            key={section.id}
            id={section.type === "rsvp" ? "rsvp" : section.id}
            className="mx-auto max-w-2xl scroll-mt-8 px-6 py-12 empty:hidden"
          >
            <SectionBody section={section} props={props} />
          </section>
        ))}

      <footer className="ev-muted px-6 pb-12 pt-6 text-center text-xs tracking-[0.2em] uppercase">
        {title}
      </footer>
    </div>
  );
}
