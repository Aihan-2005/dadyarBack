export const SUBSCRIPTION_TIERS = ["BASIC", "STANDARD", "PREMIUM"] as const;

export const SUBSCRIPTION_FEATURES = [
  "CASE_MANAGEMENT",
  "FINANCIAL_REPORTS",
  "SCHEDULING",
  "ONLINE_MEETINGS",
  "CLIENT_DIRECTORY_VISIBILITY",
] as const;

export type SubscriptionFeature = (typeof SUBSCRIPTION_FEATURES)[number];

export const SUBSCRIPTION_FEATURE_DEFINITIONS = {
  CASE_MANAGEMENT: {
    title: "Case panels",

    description: "Access to lawyer case management panels.",
  },

  FINANCIAL_REPORTS: {
    title: "Financial reports",

    description: "Access to financial reporting and financial overview tools.",
  },

  SCHEDULING: {
    title: "Scheduling",

    description: "Access to scheduling and appointment management tools.",
  },

  ONLINE_MEETINGS: {
    title: "Online meetings",

    description: "Ability to create and manage online meetings.",
  },

  CLIENT_DIRECTORY_VISIBILITY: {
    title: "Client directory visibility",

    description:
      "Allows the lawyer to appear in lawyer searches performed by clients.",
  },
} satisfies Record<
  SubscriptionFeature,
  {
    title: string;
    description: string;
  }
>;

export const DEFAULT_SUBSCRIPTION_PLAN_ACTIVE = true;

export const DEFAULT_SUBSCRIPTION_PLAN_SORT_ORDER = 0;

export const DEFAULT_SUBSCRIPTION_PLAN_DISCOUNT_PERCENT = 0;
