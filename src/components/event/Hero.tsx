import type { CSSProperties } from "react";
import type { EventContent, HeroLayout } from "@/lib/events/content";
import { formatEventDate, formatTime } from "@/lib/events/format";

type Props = {
  title: string;
  details: EventContent["details"];
  layout: HeroLayout;
  slug?: string;
};

/** "Layla & Omar" -> "L & O"; "Maya's 30th" -> "M". */
export function monogram(title: string): string {
  const [first, second] = title.split(/\s+(?:&|and|\+)\s+/i);
  const initial = (s?: string) => s?.trim().charAt(0).toUpperCase() ?? "";
  return second ? `${initial(first)} & ${initial(second)}` : initial(first);
}

/** Readable text on top of a photo or the dark cover background. */
const ON_DARK = {
  "--ev-text": "#ffffff",
  "--ev-muted": "rgba(255, 255, 255, 0.82)",
  color: "#ffffff",
} as CSSProperties;

function Photo({ src, className }: { src: string; className: string }) {
  // Hosts paste images from any site, which next/image cannot allow-list.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className={className} />;
}

function HeroText({
  title,
  details,
  slug,
  align,
  onDark,
}: Omit<Props, "layout"> & { align: "center" | "left"; onDark?: boolean }) {
  const when = [formatEventDate(details.date), formatTime(details.time)]
    .filter(Boolean)
    .join(" · ");
  const centered = align === "center";
  return (
    <div className={centered ? "text-center" : "text-left"}>
      {details.headline && <p className="ev-kicker">{details.headline}</p>}
      <h1 className="ev-title mt-4 break-words text-5xl leading-tight sm:text-7xl">
        {title}
      </h1>
      {when && (
        <p className="mt-6 text-sm tracking-[0.2em] uppercase">{when}</p>
      )}
      {details.venue && <p className="ev-muted mt-2">{details.venue}</p>}
      {details.intro && (
        <p
          className={`mt-8 max-w-xl whitespace-pre-line leading-relaxed ${
            centered ? "mx-auto" : ""
          }`}
        >
          {details.intro}
        </p>
      )}
      <div
        className={`mt-10 flex flex-wrap items-center gap-4 ${
          centered ? "justify-center" : ""
        }`}
      >
        <a href="#rsvp" className="ev-button">
          RSVP
        </a>
        {slug && details.date && (
          <a
            href={`/e/${slug}/calendar`}
            className={
              onDark
                ? "text-sm text-white underline underline-offset-4"
                : "ev-link text-sm"
            }
          >
            Add to calendar
          </a>
        )}
      </div>
    </div>
  );
}

export function Hero({ title, details, layout, slug }: Props) {
  const image = details.heroImageUrl;

  if (layout === "split") {
    return (
      <header className="grid md:min-h-[85vh] md:grid-cols-2">
        <div className="relative min-h-[40vh] overflow-hidden">
          {image ? (
            <Photo
              src={image}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="ev-hero-panel absolute inset-0 flex items-center justify-center">
              <span className="ev-title text-7xl opacity-80 sm:text-8xl">
                {monogram(title)}
              </span>
            </div>
          )}
        </div>
        <div className="ev-hero flex items-center px-8 py-14 sm:px-14">
          <HeroText title={title} details={details} slug={slug} align="left" />
        </div>
      </header>
    );
  }

  if (layout === "cover") {
    return (
      <header className="relative flex min-h-[88vh] items-center justify-center overflow-hidden px-6 py-20">
        {image ? (
          <>
            <Photo
              src={image}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </>
        ) : (
          <div className="ev-cover-fallback absolute inset-0" />
        )}
        <div className="relative" style={ON_DARK}>
          <HeroText
            title={title}
            details={details}
            slug={slug}
            align="center"
            onDark
          />
        </div>
      </header>
    );
  }

  return (
    <header className="ev-hero px-6 pb-16 pt-14">
      {image && (
        <Photo
          src={image}
          className="mx-auto mb-10 aspect-[16/9] w-full max-w-3xl rounded-2xl object-cover"
        />
      )}
      <HeroText title={title} details={details} slug={slug} align="center" />
    </header>
  );
}
