import type { EventContent, EventType, Question, Section } from "./content";

type Template = {
  label: string;
  description: string;
  title: string;
  content: EventContent;
};

const options = (...labels: string[]) =>
  labels.map((label, i) => ({ id: `opt_${i + 1}`, label }));

const rsvpSection = (title = "RSVP"): Section => ({
  id: "sec_rsvp",
  type: "rsvp",
  enabled: true,
  title,
});

const dietaryQuestion: Question = {
  id: "q_dietary",
  type: "multi",
  label: "Dietary requirements",
  required: false,
  showWhen: "attending",
  options: options(
    "Vegetarian",
    "Vegan",
    "Halal",
    "Kosher",
    "Gluten free",
    "Nut allergy",
  ),
  allowOther: true,
};

const noDetails = {
  date: "",
  time: "",
  venue: "",
  address: "",
  mapUrl: "",
  heroImageUrl: "",
};

export const TEMPLATES: Record<EventType, Template> = {
  wedding: {
    label: "Wedding",
    description: "Story, schedule, meal choice and gifts",
    title: "Alex & Sam",
    content: {
      version: 1,
      details: {
        ...noDetails,
        headline: "The wedding of",
        time: "16:00",
        intro: "We would love for you to celebrate with us.",
      },
      theme: { id: "classic", accent: "" },
      sections: [
        {
          id: "sec_story",
          type: "story",
          enabled: true,
          title: "Our story",
          body: "Tell your guests how you met, or anything you would like them to know before the day.",
        },
        {
          id: "sec_schedule",
          type: "schedule",
          enabled: true,
          title: "The day",
          items: [
            { time: "16:00", label: "Ceremony", note: "" },
            { time: "17:00", label: "Drinks and photos", note: "" },
            { time: "19:00", label: "Dinner", note: "" },
            { time: "21:00", label: "Dancing", note: "" },
          ],
        },
        {
          id: "sec_location",
          type: "location",
          enabled: true,
          title: "Getting there",
          note: "",
        },
        {
          id: "sec_countdown",
          type: "countdown",
          enabled: true,
          title: "Counting down",
        },
        rsvpSection(),
        {
          id: "sec_dress",
          type: "dressCode",
          enabled: true,
          title: "Dress code",
          body: "Formal attire.",
        },
        {
          id: "sec_gifts",
          type: "gifts",
          enabled: true,
          title: "Gifts",
          body: "Your presence is the best gift. If you would like to give something, here are the details.",
          items: [
            { label: "Account name", value: "Alex & Sam" },
            { label: "Bank", value: "Your bank" },
            { label: "Account number", value: "0000000000" },
          ],
        },
        {
          id: "sec_faq",
          type: "faq",
          enabled: false,
          title: "Questions",
          items: [
            {
              question: "Can I bring a plus one?",
              answer: "Your invitation says how many guests it covers.",
            },
          ],
        },
      ],
      rsvp: {
        deadline: "",
        allowPlusOnes: true,
        maxGuests: 2,
        collectEmail: "optional",
        questions: [
          {
            id: "q_meal",
            type: "single",
            label: "Meal choice",
            required: true,
            showWhen: "attending",
            options: options("Beef", "Fish", "Vegetarian"),
          },
          dietaryQuestion,
          {
            id: "q_song",
            type: "text",
            label: "A song that will get you dancing",
            required: false,
            showWhen: "attending",
          },
        ],
        thankYouMessage: "Thank you! We cannot wait to celebrate with you.",
      },
    },
  },

  birthday: {
    label: "Birthday",
    description: "A party page with a countdown and FAQ",
    title: "Maya's 30th",
    content: {
      version: 1,
      details: {
        ...noDetails,
        headline: "You're invited to",
        time: "19:00",
        intro: "Come and celebrate with good food, music and friends.",
      },
      theme: { id: "sunset", accent: "" },
      sections: [
        {
          id: "sec_countdown",
          type: "countdown",
          enabled: true,
          title: "Party starts in",
        },
        {
          id: "sec_location",
          type: "location",
          enabled: true,
          title: "Where",
          note: "",
        },
        rsvpSection(),
        {
          id: "sec_faq",
          type: "faq",
          enabled: true,
          title: "Good to know",
          items: [
            {
              question: "Can I bring someone?",
              answer: "Yes, add them to your reply.",
            },
            { question: "Gifts?", answer: "Not needed, just bring yourself." },
          ],
        },
      ],
      rsvp: {
        deadline: "",
        allowPlusOnes: true,
        maxGuests: 2,
        collectEmail: "off",
        questions: [
          {
            id: "q_allergies",
            type: "text",
            label: "Any food allergies?",
            required: false,
            showWhen: "attending",
          },
        ],
        thankYouMessage: "Thanks for letting us know. See you there!",
      },
    },
  },

  party: {
    label: "Party",
    description: "Dress code and who brings what",
    title: "New Year's Eve",
    content: {
      version: 1,
      details: {
        ...noDetails,
        headline: "Join us for",
        time: "21:00",
        intro: "Let's see the year out together.",
      },
      theme: { id: "midnight", accent: "" },
      sections: [
        {
          id: "sec_location",
          type: "location",
          enabled: true,
          title: "Where",
          note: "",
        },
        {
          id: "sec_dress",
          type: "dressCode",
          enabled: true,
          title: "Dress code",
          body: "Something that sparkles.",
        },
        rsvpSection(),
      ],
      rsvp: {
        deadline: "",
        allowPlusOnes: true,
        maxGuests: 3,
        collectEmail: "off",
        questions: [
          {
            id: "q_bring",
            type: "single",
            label: "What will you bring?",
            required: false,
            showWhen: "attending",
            options: options("Snacks", "Drinks", "Dessert", "Just myself"),
          },
        ],
        thankYouMessage: "You're on the list. See you at midnight!",
      },
    },
  },

  babyShower: {
    label: "Baby shower",
    description: "Registry links and a fun guess",
    title: "Baby Nora",
    content: {
      version: 1,
      details: {
        ...noDetails,
        headline: "A baby shower for",
        time: "14:00",
        intro: "Join us for an afternoon of tea, cake and celebration.",
      },
      theme: { id: "garden", accent: "" },
      sections: [
        {
          id: "sec_location",
          type: "location",
          enabled: true,
          title: "Where",
          note: "",
        },
        rsvpSection(),
        {
          id: "sec_gifts",
          type: "gifts",
          enabled: true,
          title: "Registry",
          body: "If you would like to bring a gift, these are a few ideas.",
          items: [{ label: "Registry", value: "https://example.com/registry" }],
        },
      ],
      rsvp: {
        deadline: "",
        allowPlusOnes: false,
        maxGuests: 1,
        collectEmail: "optional",
        questions: [
          {
            id: "q_guess",
            type: "text",
            label: "Guess the birth date",
            required: false,
            showWhen: "always",
          },
          dietaryQuestion,
        ],
        thankYouMessage: "Thank you! We are so happy you will be there.",
      },
    },
  },

  corporate: {
    label: "Corporate",
    description: "Agenda, session sign-up and company details",
    title: "Product launch",
    content: {
      version: 1,
      details: {
        ...noDetails,
        headline: "You're invited to our",
        time: "09:30",
        intro: "A morning of talks, demos and conversation.",
      },
      theme: { id: "modern", accent: "" },
      sections: [
        {
          id: "sec_schedule",
          type: "schedule",
          enabled: true,
          title: "Agenda",
          items: [
            { time: "09:30", label: "Registration and coffee", note: "" },
            { time: "10:00", label: "Keynote", note: "" },
            { time: "11:30", label: "Workshops", note: "" },
            { time: "13:00", label: "Lunch", note: "" },
          ],
        },
        {
          id: "sec_location",
          type: "location",
          enabled: true,
          title: "Venue",
          note: "",
        },
        rsvpSection("Register"),
        {
          id: "sec_faq",
          type: "faq",
          enabled: true,
          title: "FAQ",
          items: [{ question: "Is there parking?", answer: "Yes, on site." }],
        },
      ],
      rsvp: {
        deadline: "",
        allowPlusOnes: false,
        maxGuests: 1,
        collectEmail: "required",
        questions: [
          {
            id: "q_company",
            type: "text",
            label: "Company",
            required: true,
            showWhen: "attending",
          },
          {
            id: "q_sessions",
            type: "multi",
            label: "Which sessions will you join?",
            required: false,
            showWhen: "attending",
            options: options("Keynote", "Workshops", "Lunch"),
            allowOther: false,
          },
        ],
        thankYouMessage: "You're registered. We'll see you there.",
      },
    },
  },
};

/** A fresh copy of a template, safe to change. */
export function buildFromTemplate(type: EventType): {
  title: string;
  content: EventContent;
} {
  const template = TEMPLATES[type];
  return { title: template.title, content: structuredClone(template.content) };
}
