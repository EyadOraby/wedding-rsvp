import type { EventContent } from "./content";

export type DesignPreset = {
  name: string;
  mood: string;
  theme: EventContent["theme"];
};

/** One-click looks that combine a theme, an accent colour and a layout. */
export const DESIGN_PRESETS: DesignPreset[] = [
  {
    name: "Timeless",
    mood: "Cream, serif and a script title",
    theme: { id: "classic", accent: "", layout: "centered" },
  },
  {
    name: "Rose garden",
    mood: "Blush pinks with the photo beside the details",
    theme: { id: "blush", accent: "", layout: "split" },
  },
  {
    name: "Black tie",
    mood: "Formal black and white over a full photo",
    theme: { id: "noir", accent: "", layout: "cover" },
  },
  {
    name: "Gatsby",
    mood: "Emerald, gold and geometric lines",
    theme: { id: "deco", accent: "", layout: "centered" },
  },
  {
    name: "Desert sun",
    mood: "Terracotta and sand, relaxed and warm",
    theme: { id: "terracotta", accent: "", layout: "split" },
  },
  {
    name: "Coastal",
    mood: "Ocean blues and clean type",
    theme: { id: "ocean", accent: "", layout: "cover" },
  },
  {
    name: "Garden party",
    mood: "Sage greens, airy and light",
    theme: { id: "garden", accent: "", layout: "split" },
  },
  {
    name: "City lights",
    mood: "Navy and gold for evening events",
    theme: { id: "midnight", accent: "", layout: "cover" },
  },
  {
    name: "Confetti",
    mood: "Bright orange and bold type",
    theme: { id: "sunset", accent: "", layout: "centered" },
  },
  {
    name: "Studio",
    mood: "White space and a strong blue",
    theme: { id: "modern", accent: "", layout: "split" },
  },
  {
    name: "Lavender",
    mood: "Classic layout with a lilac accent",
    theme: { id: "classic", accent: "#8a6fb0", layout: "centered" },
  },
  {
    name: "Olive grove",
    mood: "Terracotta warmth with olive green",
    theme: { id: "terracotta", accent: "#6b7a3a", layout: "centered" },
  },
];
