import type { EventContent, ThemeId } from "./content";

export type Theme = {
  id: ThemeId;
  name: string;
  description: string;
  colors: {
    background: string;
    surface: string;
    text: string;
    muted: string;
    accent: string;
    line: string;
  };
  headingFont: "serif" | "sans";
  /** Show the event title in the script font. */
  scriptTitle: boolean;
};

export const THEMES: Record<ThemeId, Theme> = {
  classic: {
    id: "classic",
    name: "Classic",
    description: "Cream paper, serif type and a script title",
    colors: {
      background: "#f7f5f0",
      surface: "#ffffff",
      text: "#2a2a2a",
      muted: "#5c5c5c",
      accent: "#b87d8a",
      line: "#2a2a2a",
    },
    headingFont: "serif",
    scriptTitle: true,
  },
  garden: {
    id: "garden",
    name: "Garden",
    description: "Soft sage greens for outdoor and daytime events",
    colors: {
      background: "#f1f4ec",
      surface: "#ffffff",
      text: "#243127",
      muted: "#56645a",
      accent: "#5f8a68",
      line: "#9fb3a3",
    },
    headingFont: "serif",
    scriptTitle: true,
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    description: "Deep navy with gold, for evening parties",
    colors: {
      background: "#0f1a2e",
      surface: "#17243d",
      text: "#f4efe3",
      muted: "#b9b3a6",
      accent: "#d4af37",
      line: "#3a4a68",
    },
    headingFont: "serif",
    scriptTitle: true,
  },
  modern: {
    id: "modern",
    name: "Modern",
    description: "Clean white and bold sans-serif type",
    colors: {
      background: "#ffffff",
      surface: "#f5f5f4",
      text: "#111111",
      muted: "#57534e",
      accent: "#2f5bea",
      line: "#d6d3d1",
    },
    headingFont: "sans",
    scriptTitle: false,
  },
  sunset: {
    id: "sunset",
    name: "Sunset",
    description: "Warm oranges for birthdays and celebrations",
    colors: {
      background: "#fff6ed",
      surface: "#ffffff",
      text: "#3b1d0f",
      muted: "#7a4a33",
      accent: "#e2622b",
      line: "#f0c8a8",
    },
    headingFont: "sans",
    scriptTitle: false,
  },
};

export const THEME_LIST = Object.values(THEMES);

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/** Text colour that stays readable on top of the given background colour. */
export function readableOn(hex: string): string {
  return luminance(hex) > 0.4 ? "#111111" : "#ffffff";
}

/** CSS variables that the event page components read. */
export function themeVariables(
  theme: EventContent["theme"],
): Record<string, string> {
  const base = THEMES[theme.id];
  const accent = theme.accent || base.colors.accent;
  return {
    "--ev-bg": base.colors.background,
    "--ev-surface": base.colors.surface,
    "--ev-text": base.colors.text,
    "--ev-muted": base.colors.muted,
    "--ev-accent": accent,
    "--ev-on-accent": readableOn(accent),
    "--ev-line": base.colors.line,
    "--ev-heading-font":
      base.headingFont === "sans"
        ? "var(--font-inter), system-ui, sans-serif"
        : "var(--font-playfair), Georgia, serif",
    "--ev-title-font": base.scriptTitle
      ? "var(--font-great-vibes), cursive"
      : "var(--ev-heading-font)",
  };
}
