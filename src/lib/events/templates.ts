import type { EventContent, EventType, Section } from "./content";
import { dietaryQuestions } from "./dietary";

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

const [dietaryQuestion, allergyQuestion] = dietaryQuestions();

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
      theme: { id: "classic", accent: "", layout: "centered" },
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
          allergyQuestion,
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
      theme: { id: "sunset", accent: "", layout: "cover" },
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
        questions: [],
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
      theme: { id: "midnight", accent: "", layout: "cover" },
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
      theme: { id: "garden", accent: "", layout: "split" },
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
          allergyQuestion,
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
      theme: { id: "modern", accent: "", layout: "split" },
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

  engagement: {
    label: "Engagement party",
    description: "A relaxed celebration before the big day",
    title: "Nadia & Karim",
    content: {
      version: 1,
      details: {
        ...noDetails,
        headline: "Celebrate the engagement of",
        time: "19:30",
        intro: "We said yes! Join us for drinks, dinner and dancing.",
      },
      theme: { id: "blush", accent: "", layout: "split" },
      sections: [
        {
          id: "sec_story",
          type: "story",
          enabled: true,
          title: "How it happened",
          body: "Share the proposal story with your guests.",
        },
        {
          id: "sec_location",
          type: "location",
          enabled: true,
          title: "Where",
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
          body: "Cocktail attire.",
        },
      ],
      rsvp: {
        deadline: "",
        allowPlusOnes: true,
        maxGuests: 2,
        collectEmail: "optional",
        questions: [
          {
            id: "q_afterparty",
            type: "yesno",
            label: "Will you join us for the after-party?",
            required: false,
            showWhen: "attending",
          },
          {
            id: "q_song",
            type: "text",
            label: "A song we should play",
            required: false,
            showWhen: "attending",
          },
        ],
        thankYouMessage: "Thank you! We can't wait to celebrate with you.",
      },
    },
  },

  dinnerParty: {
    label: "Dinner party",
    description: "An intimate dinner with the menu and dietary needs",
    title: "Dinner at Rami's",
    content: {
      version: 1,
      details: {
        ...noDetails,
        headline: "You're invited to",
        time: "20:00",
        intro: "A long table, good food and better company.",
      },
      theme: { id: "terracotta", accent: "", layout: "split" },
      sections: [
        {
          id: "sec_story",
          type: "story",
          enabled: true,
          title: "On the menu",
          body: "Starters to share\nSlow-roasted lamb or stuffed peppers\nOrange blossom cake",
        },
        {
          id: "sec_location",
          type: "location",
          enabled: true,
          title: "Where",
          note: "",
        },
        rsvpSection(),
      ],
      rsvp: {
        deadline: "",
        allowPlusOnes: true,
        maxGuests: 2,
        collectEmail: "off",
        questions: [
          {
            id: "q_main",
            type: "single",
            label: "Main course",
            required: true,
            showWhen: "attending",
            options: options("Lamb", "Stuffed peppers (vegetarian)"),
          },
          dietaryQuestion,
          allergyQuestion,
          {
            id: "q_bottle",
            type: "yesno",
            label: "Bringing something to drink?",
            required: false,
            showWhen: "attending",
          },
        ],
        thankYouMessage: "Lovely, a seat is saved for you.",
      },
    },
  },

  graduation: {
    label: "Graduation",
    description: "Ceremony and party, with who comes to which",
    title: "Lina graduates!",
    content: {
      version: 1,
      details: {
        ...noDetails,
        headline: "Class of 2027",
        time: "17:00",
        intro: "Four years, one diploma and a party to celebrate it.",
      },
      theme: { id: "ocean", accent: "", layout: "cover" },
      sections: [
        {
          id: "sec_schedule",
          type: "schedule",
          enabled: true,
          title: "The day",
          items: [
            { time: "14:00", label: "Graduation ceremony", note: "" },
            { time: "17:00", label: "Party at home", note: "" },
          ],
        },
        {
          id: "sec_location",
          type: "location",
          enabled: true,
          title: "Where",
          note: "",
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
            id: "q_parts",
            type: "multi",
            label: "Which parts will you join?",
            required: true,
            showWhen: "attending",
            options: options("Ceremony", "Party"),
            allowOther: false,
          },
        ],
        thankYouMessage: "Thank you! See you there.",
      },
    },
  },

  anniversary: {
    label: "Anniversary",
    description: "A milestone celebration with dinner choices",
    title: "Mona & Adel",
    content: {
      version: 1,
      details: {
        ...noDetails,
        headline: "25 years of",
        time: "19:00",
        intro: "Join us to celebrate a quarter of a century together.",
      },
      theme: { id: "deco", accent: "", layout: "centered" },
      sections: [
        {
          id: "sec_story",
          type: "story",
          enabled: true,
          title: "Our story",
          body: "Married in 2002, still dancing in the kitchen.",
        },
        {
          id: "sec_schedule",
          type: "schedule",
          enabled: true,
          title: "The evening",
          items: [
            { time: "19:00", label: "Welcome drinks", note: "" },
            { time: "20:00", label: "Dinner and speeches", note: "" },
          ],
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
          id: "sec_dress",
          type: "dressCode",
          enabled: true,
          title: "Dress code",
          body: "Black tie optional. A touch of silver is welcome.",
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
            label: "Dinner choice",
            required: true,
            showWhen: "attending",
            options: options("Beef", "Fish", "Vegetarian"),
          },
          dietaryQuestion,
          allergyQuestion,
        ],
        thankYouMessage: "Thank you for celebrating with us.",
      },
    },
  },

  meetup: {
    label: "Meetup",
    description: "Talks, registration and attendee details",
    title: "Design & Code Night",
    content: {
      version: 1,
      details: {
        ...noDetails,
        headline: "Monthly meetup",
        time: "18:30",
        intro: "Two short talks, pizza and plenty of time to meet people.",
      },
      theme: { id: "noir", accent: "", layout: "cover" },
      sections: [
        {
          id: "sec_schedule",
          type: "schedule",
          enabled: true,
          title: "Programme",
          items: [
            { time: "18:30", label: "Doors open", note: "" },
            {
              time: "19:00",
              label: "Talk: Designing for small screens",
              note: "",
            },
            { time: "19:40", label: "Talk: Shipping side projects", note: "" },
            { time: "20:20", label: "Pizza and networking", note: "" },
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
          items: [
            { question: "Is it free?", answer: "Yes, but places are limited." },
            {
              question: "Will the talks be recorded?",
              answer: "Slides are shared afterwards.",
            },
          ],
        },
      ],
      rsvp: {
        deadline: "",
        allowPlusOnes: false,
        maxGuests: 1,
        collectEmail: "required",
        questions: [
          {
            id: "q_role",
            type: "single",
            label: "What do you do?",
            required: false,
            showWhen: "attending",
            options: options(
              "Design",
              "Engineering",
              "Product",
              "Student",
              "Something else",
            ),
          },
          {
            id: "q_company",
            type: "text",
            label: "Company or school",
            required: false,
            showWhen: "attending",
          },
          dietaryQuestion,
          allergyQuestion,
        ],
        thankYouMessage: "You're registered. See you there!",
      },
    },
  },
};

// Every event serves food, so every template asks about dietary needs and
// allergies, and meal questions feed the kitchen summary too.
for (const template of Object.values(TEMPLATES)) {
  const questions = template.content.rsvp.questions;
  for (const question of questions) {
    if (question.id === "q_meal" || question.id === "q_main")
      question.kitchen = true;
  }
  for (const question of dietaryQuestions()) {
    if (!questions.some((q) => q.id === question.id)) questions.push(question);
  }
}

/** A fresh copy of a template, safe to change. */
export function buildFromTemplate(type: EventType): {
  title: string;
  content: EventContent;
} {
  const template = TEMPLATES[type];
  return { title: template.title, content: structuredClone(template.content) };
}
