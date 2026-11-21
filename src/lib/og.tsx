import { ImageResponse } from "next/og";
import { APP_NAME } from "@/config/app";
import type { EventContent } from "./events/content";
import { formatEventDate, formatTime } from "./events/format";
import { readableOn, THEMES } from "./events/themes";

export const OG_SIZE = { width: 1200, height: 630 };

/** Share card for the site itself and for events that are not public. */
export function brandImage(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#1c1917",
        color: "#fafaf9",
      }}
    >
      <div style={{ fontSize: 88, fontWeight: 700 }}>{APP_NAME}</div>
      <div style={{ fontSize: 36, marginTop: 24, color: "#d6d3d1" }}>
        Beautiful RSVP pages for any event
      </div>
      <div
        style={{
          marginTop: 48,
          width: 120,
          height: 12,
          borderRadius: 6,
          background: "#e2622b",
        }}
      />
    </div>,
    OG_SIZE,
  );
}

/** Share card for a published event, in the event's own colours. */
export function eventImage(
  title: string,
  content: EventContent,
): ImageResponse {
  const theme = THEMES[content.theme.id];
  const accent = content.theme.accent || theme.colors.accent;
  const { details } = content;
  const when = [formatEventDate(details.date), formatTime(details.time)]
    .filter(Boolean)
    .join(" · ");
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
        textAlign: "center",
        background: theme.colors.background,
        color: theme.colors.text,
        borderBottom: `18px solid ${accent}`,
      }}
    >
      {details.headline && (
        <div
          style={{
            fontSize: 28,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: theme.colors.muted,
          }}
        >
          {details.headline}
        </div>
      )}
      <div
        style={{
          fontSize: title.length > 24 ? 76 : 100,
          fontWeight: 700,
          marginTop: 24,
          lineHeight: 1.1,
          textTransform: theme.upperTitle ? "uppercase" : "none",
        }}
      >
        {title}
      </div>
      {when && (
        <div style={{ fontSize: 32, marginTop: 36, letterSpacing: 3 }}>
          {when}
        </div>
      )}
      {details.venue && (
        <div style={{ fontSize: 28, marginTop: 12, color: theme.colors.muted }}>
          {details.venue}
        </div>
      )}
      <div
        style={{
          marginTop: 44,
          padding: "14px 44px",
          borderRadius: 999,
          background: accent,
          color: readableOn(accent),
          fontSize: 26,
          letterSpacing: 6,
        }}
      >
        RSVP
      </div>
    </div>,
    OG_SIZE,
  );
}
