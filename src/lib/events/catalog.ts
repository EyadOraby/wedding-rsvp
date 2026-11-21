import {
  createId,
  type Question,
  type QuestionType,
  type Section,
  type SectionType,
} from "./content";
import { dietaryQuestions } from "./dietary";

type CatalogEntry = { label: string; description: string };

export const SECTION_CATALOG: Record<SectionType, CatalogEntry> = {
  story: {
    label: "Story",
    description: "A few paragraphs about you or the event",
  },
  schedule: { label: "Schedule", description: "What happens when" },
  location: { label: "Location", description: "Venue, address and a map link" },
  countdown: { label: "Countdown", description: "Days left until the event" },
  dressCode: { label: "Dress code", description: "What guests should wear" },
  gifts: { label: "Gifts", description: "Registry links or bank details" },
  faq: { label: "FAQ", description: "Answers to common questions" },
  rsvp: { label: "RSVP form", description: "Where guests reply" },
};

export const QUESTION_CATALOG: Record<QuestionType, CatalogEntry> = {
  single: { label: "Single choice", description: "Pick one, e.g. a meal" },
  multi: {
    label: "Multiple choice",
    description: "Pick any, e.g. dietary needs",
  },
  yesno: { label: "Yes / no", description: "e.g. Do you need parking?" },
  text: { label: "Short answer", description: "One line of text" },
  longtext: { label: "Long answer", description: "A paragraph of text" },
};

/** Sections a host can add; the RSVP form is always there already. */
export const ADDABLE_SECTION_TYPES = (
  Object.keys(SECTION_CATALOG) as SectionType[]
).filter((type) => type !== "rsvp");

export function newSection(type: SectionType): Section {
  const base = {
    id: createId("sec"),
    enabled: true,
    title: SECTION_CATALOG[type].label,
  };
  switch (type) {
    case "story":
      return { ...base, type, title: "Our story", body: "" };
    case "schedule":
      return {
        ...base,
        type,
        items: [{ time: "", label: "Arrival", note: "" }],
      };
    case "location":
      return { ...base, type, note: "" };
    case "countdown":
      return { ...base, type, title: "Counting down" };
    case "dressCode":
      return { ...base, type, body: "" };
    case "gifts":
      return { ...base, type, body: "", items: [] };
    case "faq":
      return {
        ...base,
        type,
        title: "Questions",
        items: [{ question: "Is there parking?", answer: "" }],
      };
    case "rsvp":
      return { ...base, type, enabled: true, title: "RSVP" };
  }
}

/** One-click questions for the RSVP form builder. */
export const QUESTION_PRESETS: { label: string; build: () => Question[] }[] = [
  {
    label: "Dietary needs & allergies",
    build: () => dietaryQuestions(true),
  },
  {
    label: "Meal choice",
    build: () => [
      {
        id: createId("q"),
        type: "single",
        label: "Meal choice",
        required: true,
        showWhen: "attending",
        kitchen: true,
        options: ["Meat", "Fish", "Vegetarian"].map((label) => ({
          id: createId("opt"),
          label,
        })),
      },
    ],
  },
  {
    label: "Song request",
    build: () => [
      {
        id: createId("q"),
        type: "text",
        label: "A song that will get you dancing",
        required: false,
        showWhen: "attending",
      },
    ],
  },
];

export function newQuestion(type: QuestionType): Question {
  const base = {
    id: createId("q"),
    label: "",
    required: false,
    showWhen: "attending" as const,
  };
  const options = [
    { id: createId("opt"), label: "Option 1" },
    { id: createId("opt"), label: "Option 2" },
  ];
  switch (type) {
    case "single":
      return { ...base, type, label: "Choose one", options };
    case "multi":
      return {
        ...base,
        type,
        label: "Choose any",
        options,
        allowOther: false,
      };
    case "yesno":
      return { ...base, type, label: "Yes or no?" };
    case "text":
      return { ...base, type, label: "Your answer" };
    case "longtext":
      return { ...base, type, label: "Tell us more" };
  }
}
