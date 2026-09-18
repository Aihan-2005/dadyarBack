import { openApiRegistry } from "../openapi.registry";

import {
  ApiErrorSchema,
  SubscriptionPlanListSuccessSchema,
  SubscriptionPlanSuccessSchema,
} from "../schemas/subscriptionPlan.openapi.schemas";

import { SubscriptionPlanIdParamSchema } from "../../validators/subscriptionPlan.validator";

// ========================================================
// Shared Responses
// ========================================================

const badRequestResponse = {
  description:
    "The submitted request, route parameters, or request body are invalid.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const notFoundResponse = {
  description: "The requested subscription plan was not found.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const serverErrorResponse = {
  description: "Unexpected server error.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

// ========================================================
// GET /subscription-plans
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/subscription-plans",

  operationId: "listPublicSubscriptionPlans",

  tags: ["Subscription Plans"],

  summary: "List available subscription plans",

  description: `
Returns the subscription plans currently available to the public.

Authentication is **not required**.

Only plans whose:

\`isActive = true\`

are returned.

Inactive plans are intentionally hidden from this endpoint because they are no longer available for new purchases or subscriptions.

### Ordering

Plans are ordered by:

1. \`sortOrder ASC\`
2. \`price ASC\`

The \`sortOrder\` field allows administrators to control how plans should be presented without relying on tier names or database insertion order.

### Tier

Each plan has one of the following descriptive tiers:

- \`BASIC\`
- \`STANDARD\`
- \`PREMIUM\`

The tier identifies the general commercial level of the plan.

Actual application access is represented by the plan's \`features\` array rather than being inferred only from the tier.

### Features

Possible feature codes currently include:

- \`CASE_MANAGEMENT\`
- \`FINANCIAL_REPORTS\`
- \`SCHEDULING\`
- \`ONLINE_MEETINGS\`
- \`CLIENT_DIRECTORY_VISIBILITY\`

A higher tier can contain all features from a lower tier, but this is represented explicitly by the stored feature array.

### Duration

\`durationMonths\` represents the subscription duration in months.

For example:

- \`1\` = one month
- \`3\` = three months
- \`12\` = twelve months

### Pricing

\`price\` is stored as a non-negative integer.

\`discountPercent\` is an integer between:

\`0\` and \`100\`

A value of:

\`0\`

means no discount.

The API currently stores the base price and discount separately rather than persisting a second derived final-price field.
`,

  responses: {
    200: {
      description: "Active subscription plans returned successfully.",

      content: {
        "application/json": {
          schema: SubscriptionPlanListSuccessSchema,
        },
      },
    },

    500: serverErrorResponse,
  },
});

// ========================================================
// GET /subscription-plans/{id}
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/subscription-plans/{id}",

  operationId: "getPublicSubscriptionPlan",

  tags: ["Subscription Plans"],

  summary: "Get one available subscription plan",

  description: `
Returns one publicly available subscription plan by MongoDB ObjectId.

Authentication is **not required**.

The plan must both:

- exist
- have \`isActive = true\`

An inactive plan is intentionally treated as unavailable through the public API and therefore returns the same not-found response as a nonexistent plan.

This prevents archived or discontinued plans from being discovered and selected through the normal public subscription flow.
`,

  request: {
    params: SubscriptionPlanIdParamSchema,
  },

  responses: {
    200: {
      description: "Subscription plan returned successfully.",

      content: {
        "application/json": {
          schema: SubscriptionPlanSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    404: notFoundResponse,

    500: serverErrorResponse,
  },
});
