import type { Section } from "@/lib/events/content";
import { formatTime } from "@/lib/events/format";
import type { EventContent } from "@/lib/events/content";
import { Countdown } from "./Countdown";

type SectionOf<T extends Section["type"]> = Extract<Section, { type: T }>;

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="ev-section-title mb-8">{children}</h2>;
}

function Paragraphs({ text }: { text: string }) {
  return <p className="whitespace-pre-line leading-relaxed">{text}</p>;
}

/** Shows "16:00" as "4:00 PM" but leaves free text like "Late" alone. */
function displayTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? formatTime(value) : value;
}

function isLink(value: string) {
  return /^https:\/\/\S+$/.test(value);
}

export function StorySection({ section }: { section: SectionOf<"story"> }) {
  if (!section.body) return null;
  return (
    <div className="text-center">
      <SectionTitle>{section.title}</SectionTitle>
      <Paragraphs text={section.body} />
    </div>
  );
}

export function ScheduleSection({
  section,
}: {
  section: SectionOf<"schedule">;
}) {
  if (section.items.length === 0) return null;
  return (
    <div>
      <SectionTitle>{section.title}</SectionTitle>
      <ol className="space-y-5">
        {section.items.map((item, i) => (
          <li key={i} className="grid grid-cols-[6rem_1fr] gap-4">
            <span className="ev-muted text-right text-sm tracking-wide">
              {displayTime(item.time)}
            </span>
            <div>
              <p className="font-medium">{item.label}</p>
              {item.note && <p className="ev-muted text-sm">{item.note}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function LocationSection({
  section,
  details,
}: {
  section: SectionOf<"location">;
  details: EventContent["details"];
}) {
  const { venue, address, mapUrl } = details;
  if (!venue && !address && !section.note) return null;
  const map =
    mapUrl ||
    (address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          [venue, address].filter(Boolean).join(", "),
        )}`
      : "");
  return (
    <div className="text-center">
      <SectionTitle>{section.title}</SectionTitle>
      {venue && <p className="text-lg font-medium">{venue}</p>}
      {address && (
        <p className="ev-muted mt-1 whitespace-pre-line">{address}</p>
      )}
      {section.note && (
        <p className="mt-4 whitespace-pre-line leading-relaxed">
          {section.note}
        </p>
      )}
      {map && (
        <a
          href={map}
          target="_blank"
          rel="noopener noreferrer"
          className="ev-link mt-4 inline-block text-sm"
        >
          Open in maps
        </a>
      )}
    </div>
  );
}

export function CountdownSection({
  section,
  date,
}: {
  section: SectionOf<"countdown">;
  date: string;
}) {
  if (!date) return null;
  return (
    <div className="text-center">
      <SectionTitle>{section.title}</SectionTitle>
      <Countdown date={date} />
    </div>
  );
}

export function DressCodeSection({
  section,
}: {
  section: SectionOf<"dressCode">;
}) {
  if (!section.body) return null;
  return (
    <div className="text-center">
      <SectionTitle>{section.title}</SectionTitle>
      <Paragraphs text={section.body} />
    </div>
  );
}

export function GiftsSection({ section }: { section: SectionOf<"gifts"> }) {
  if (!section.body && section.items.length === 0) return null;
  return (
    <div className="text-center">
      <SectionTitle>{section.title}</SectionTitle>
      {section.body && <Paragraphs text={section.body} />}
      {section.items.length > 0 && (
        <dl className="ev-card mx-auto mt-6 max-w-md space-y-4 p-6">
          {section.items.map((item, i) => (
            <div key={i}>
              <dt className="ev-kicker">{item.label}</dt>
              <dd className="mt-1 break-words">
                {isLink(item.value) ? (
                  <a
                    href={item.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ev-link"
                  >
                    {item.value.replace(/^https:\/\//, "")}
                  </a>
                ) : (
                  item.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export function FaqSection({ section }: { section: SectionOf<"faq"> }) {
  if (section.items.length === 0) return null;
  return (
    <div>
      <SectionTitle>{section.title}</SectionTitle>
      <div className="space-y-3">
        {section.items.map((item, i) => (
          <details key={i} className="ev-card group p-4">
            <summary className="cursor-pointer list-none font-medium">
              <span className="ev-muted mr-2 inline-block transition-transform group-open:rotate-90">
                ›
              </span>
              {item.question}
            </summary>
            {item.answer && (
              <p className="ev-muted mt-3 whitespace-pre-line pl-5 leading-relaxed">
                {item.answer}
              </p>
            )}
          </details>
        ))}
      </div>
    </div>
  );
}
