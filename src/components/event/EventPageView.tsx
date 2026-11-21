import Link from "next/link";
import type { CSSProperties } from "react";
import { APP_NAME } from "@/config/app";
import type { EventContent, Section } from "@/lib/events/content";
import { themeVariables } from "@/lib/events/themes";
import { EventRsvpForm } from "./EventRsvpForm";
import { Hero } from "./Hero";
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
  /** Pre-filled or edit mode for the RSVP form, e.g. from a personal invite. */
  form?: Pick<
    React.ComponentProps<typeof EventRsvpForm>,
    "initial" | "editToken" | "invite"
  >;
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
          {...props.form}
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

  return (
    <div
      className="ev min-h-full"
      style={themeVariables(content.theme) as CSSProperties}
    >
      {notice}
      <Hero
        title={title}
        details={content.details}
        layout={content.theme.layout}
        slug={slug}
      />

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

      <footer className="ev-muted px-6 pb-10 pt-6 text-center text-xs">
        <p className="tracking-[0.2em] uppercase">{title}</p>
        {slug && (
          <Link
            href="/"
            className="mt-6 inline-block opacity-70 hover:opacity-100"
          >
            Made with {APP_NAME}
          </Link>
        )}
      </footer>
    </div>
  );
}
