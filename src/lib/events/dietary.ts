import { createId, type Question } from "./content";

export const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Halal",
  "Kosher",
  "Gluten free",
  "Nut allergy",
  "Dairy free",
  "Shellfish allergy",
];

/**
 * The dietary needs and allergies pair used by templates and the builder's
 * quick-add. Templates use fixed ids; the builder asks for fresh ones so a
 * second copy never clashes with the first.
 */
export function dietaryQuestions(freshIds = false): [Question, Question] {
  const id = (fixed: string, prefix: string) =>
    freshIds ? createId(prefix) : fixed;
  return [
    {
      id: id("q_dietary", "q"),
      type: "multi",
      label: "Dietary requirements",
      required: false,
      showWhen: "attending",
      kitchen: true,
      options: DIETARY_OPTIONS.map((label, i) => ({
        id: freshIds ? createId("opt") : `opt_${i + 1}`,
        label,
      })),
      allowOther: true,
    },
    {
      id: id("q_allergies", "q"),
      type: "text",
      label: "Allergies or food notes for the kitchen",
      required: false,
      showWhen: "attending",
      kitchen: true,
    },
  ];
}
