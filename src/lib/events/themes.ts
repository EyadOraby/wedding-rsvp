import type { EventContent, HeroLayout, ThemeId } from "./content";

type FontRole = "serif" | "elegant" | "sans" | "deco";
type Pattern = "none" | "dots" | "grid" | "glow";

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
  headingFont: FontRole;
  /** Show the event title in the script font. */
  scriptTitle: boolean;
  /** Spaced capitals for the title, e.g. Art Deco and Noir. */
  upperTitle?: boolean;
  /** Subtle background behind the top of the page. */
  pattern: Pattern;
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
    pattern: "none",
  },
  blush: {
    id: "blush",
    name: "Blush",
    description: "Soft pinks and a delicate serif",
    colors: {
      background: "#fdf3f4",
      surface: "#ffffff",
      text: "#4a2c34",
      muted: "#86616b",
      accent: "#c26b83",
      line: "#e6bfc8",
    },
    headingFont: "elegant",
    scriptTitle: true,
    pattern: "glow",
  },
  garden: {
    id: "garden",
    name: "Garden",
    description: "Sage greens for outdoor and daytime events",
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
    pattern: "dots",
  },
  terracotta: {
    id: "terracotta",
    name: "Terracotta",
    description: "Warm clay and sand, relaxed and earthy",
    colors: {
      background: "#f6efe6",
      surface: "#fffaf3",
      text: "#3d2a1e",
      muted: "#7a5a45",
      accent: "#b85c35",
      line: "#d9bfa3",
    },
    headingFont: "elegant",
    scriptTitle: false,
    pattern: "glow",
  },
  sunset: {
    id: "sunset",
    name: "Sunset",
    description: "Bright oranges for birthdays and celebrations",
    colors: {
      background: "#fff6ed",
      surface: "#ffffff",
      text: "#3b1d0f",
      muted: "#7a4a33",
      accent: "#d9551f",
      line: "#f0c8a8",
    },
    headingFont: "sans",
    scriptTitle: false,
    pattern: "dots",
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    description: "Fresh blues for coastal and summer events",
    colors: {
      background: "#eef5f8",
      surface: "#ffffff",
      text: "#10324a",
      muted: "#4b687c",
      accent: "#1f7393",
      line: "#b5d1dd",
    },
    headingFont: "sans",
    scriptTitle: false,
    pattern: "glow",
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
    pattern: "none",
  },
  noir: {
    id: "noir",
    name: "Noir",
    description: "Black and white, minimal and formal",
    colors: {
      background: "#101010",
      surface: "#1a1a1a",
      text: "#f2f2f2",
      muted: "#a8a8a8",
      accent: "#f2f2f2",
      line: "#3d3d3d",
    },
    headingFont: "elegant",
    scriptTitle: false,
    upperTitle: true,
    pattern: "none",
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
    pattern: "glow",
  },
  deco: {
    id: "deco",
    name: "Art Deco",
    description: "Emerald and gold with geometric lines",
    colors: {
      background: "#0f2a26",
      surface: "#163a34",
      text: "#f3e9d2",
      muted: "#c9b994",
      accent: "#c9a24b",
      line: "#3f5f56",
    },
    headingFont: "deco",
    scriptTitle: false,
    upperTitle: true,
    pattern: "grid",
  },
};

export const THEME_LIST = Object.values(THEMES);

export const HERO_LAYOUT_OPTIONS: Record<
  HeroLayout,
  { label: string; description: string }
> = {
  centered: {
    label: "Centred",
    description: "Title in the middle, photo above",
  },
  split: {
    label: "Split",
    description: "Photo on one side, details on the other",
  },
  cover: { label: "Cover", description: "Full-screen photo behind the title" },
};

const FONT_STACKS: Record<FontRole, string> = {
  serif: "var(--font-playfair), Georgia, serif",
  elegant: "var(--font-cormorant), Georgia, serif",
  sans: "var(--font-inter), system-ui, sans-serif",
  deco: "var(--font-josefin), system-ui, sans-serif",
};

/** Font for the event title, also used by theme previews. */
export function titleFont(theme: Theme): string {
  return theme.scriptTitle
    ? "var(--font-great-vibes), cursive"
    : FONT_STACKS[theme.headingFont];
}

const PATTERNS: Record<Pattern, { image: string; size: string }> = {
  none: { image: "none", size: "auto" },
  dots: {
    image:
      "radial-gradient(color-mix(in srgb, var(--ev-accent) 22%, transparent) 1.2px, transparent 1.3px)",
    size: "22px 22px",
  },
  grid: {
    image:
      "linear-gradient(color-mix(in srgb, var(--ev-accent) 14%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--ev-accent) 14%, transparent) 1px, transparent 1px)",
    // One size per gradient layer.
    size: "44px 44px, 44px 44px",
  },
  glow: {
    image:
      "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in srgb, var(--ev-accent) 20%, transparent), transparent 70%)",
    size: "100% 100%",
  },
};

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/** Text colour that stays readable on top of the given background colour. */
export function readableOn(hex: string): string {
  // Pick whichever of near-black or white has the higher WCAG contrast ratio.
  const l = luminance(hex);
  const onWhite = 1.05 / (l + 0.05);
  const onDark = (l + 0.05) / (luminance("#111111") + 0.05);
  return onDark >= onWhite ? "#111111" : "#ffffff";
}

/** CSS variables that the event page components read. */
export function themeVariables(
  theme: Pick<EventContent["theme"], "id" | "accent">,
): Record<string, string> {
  const base = THEMES[theme.id];
  const accent = theme.accent || base.colors.accent;
  const pattern = PATTERNS[base.pattern];
  return {
    "--ev-bg": base.colors.background,
    "--ev-surface": base.colors.surface,
    "--ev-text": base.colors.text,
    "--ev-muted": base.colors.muted,
    "--ev-accent": accent,
    "--ev-on-accent": readableOn(accent),
    "--ev-line": base.colors.line,
    "--ev-heading-font": FONT_STACKS[base.headingFont],
    "--ev-title-font": titleFont(base),
    "--ev-title-transform": base.upperTitle ? "uppercase" : "none",
    "--ev-title-spacing": base.upperTitle ? "0.12em" : "normal",
    "--ev-pattern": pattern.image,
    "--ev-pattern-size": pattern.size,
  };
}
