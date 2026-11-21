import { describe, expect, it } from "vitest";
import { monogram } from "@/components/event/Hero";
import { themeSchema, THEME_IDS } from "../content";
import { DESIGN_PRESETS } from "../presets";
import { THEMES, themeVariables } from "../themes";

describe("design presets", () => {
  it.each(DESIGN_PRESETS.map((p) => [p.name, p]))(
    "%s is a valid theme",
    (_, preset) => {
      expect(themeSchema.safeParse(preset.theme).success).toBe(true);
    },
  );

  it("have unique names", () => {
    const names = DESIGN_PRESETS.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("themes", () => {
  it("defines every theme id", () => {
    expect(Object.keys(THEMES).sort()).toEqual([...THEME_IDS].sort());
  });

  it("sets fonts, title style and pattern variables", () => {
    const deco = themeVariables({ id: "deco", accent: "" });
    expect(deco["--ev-heading-font"]).toContain("--font-josefin");
    expect(deco["--ev-title-transform"]).toBe("uppercase");
    expect(deco["--ev-pattern"]).toContain("linear-gradient");
    const classic = themeVariables({ id: "classic", accent: "" });
    expect(classic["--ev-title-font"]).toContain("--font-great-vibes");
    expect(classic["--ev-pattern"]).toBe("none");
  });

  it("keeps button text readable on every theme accent", () => {
    for (const theme of Object.values(THEMES)) {
      const vars = themeVariables({ id: theme.id, accent: "" });
      expect(["#111111", "#ffffff"]).toContain(vars["--ev-on-accent"]);
    }
    expect(themeVariables({ id: "noir", accent: "" })["--ev-on-accent"]).toBe(
      "#111111",
    );
  });
});

describe("monogram", () => {
  it.each([
    ["Layla & Omar", "L & O"],
    ["Mona and Adel", "M & A"],
    ["Maya's 30th", "M"],
    ["design night", "D"],
  ])("%s -> %s", (title, expected) => {
    expect(monogram(title)).toBe(expected);
  });
});
