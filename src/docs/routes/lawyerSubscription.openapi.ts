import { openApiRegistry } from "../openapi.registry";

import {
  ApiErrorSchema,
  CurrentLawyerSubscriptionSuccessSchema,
} from "../schemas/lawyerSubscription.openapi.schemas";

// ========================================================
// Shared Security
// ========================================================

const lawyerSecurity = [
  {
    bearerAuth: [],
  },
];

// ========================================================
// Shared Responses
// ========================================================

const unauthorizedResponse = {
  description:
    "Authentication is required or the supplied access token is invalid.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const forbiddenResponse = {
  description:
    "The authenticated account is not permitted to access lawyer subscription resources. A LAWYER account is required.",

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
// GET /lawyer-subscriptions/current
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/lawyer-subscriptions/current",

  operationId: "getCurrentLawyerSubscription",

  tags: ["Lawyer Subscriptions"],

  summary: "Get the authenticated lawyer's current subscription",

  description: `
Returns the currently active subscription belonging to the authenticated lawyer.

This endpoint requires:

\`Authorization: Bearer <accessToken>\`

and the authenticated User must have role:

\`LAWYER\`

### Current subscription

A subscription is considered current when all of the following are true:

- \`cancelledAt = null\`
- \`startsAt <= now\`
- \`endsAt > now\`

If the lawyer does not currently have an active subscription, the endpoint does **not** return a not-found error.

Instead:

\`\`\`json
{
  "success": true,
  "data": null
}
\`\`\`

is returned.

### Status

The \`status\` field is calculated when the response is produced rather than persisted as a separate database field.

Possible values are:

- \`ACTIVE\`
- \`EXPIRED\`
- \`CANCELLED\`

A subscription with a non-null \`cancelledAt\` is considered \`CANCELLED\`.

Otherwise, a subscription whose \`endsAt\` is in the past is considered \`EXPIRED\`.

Otherwise it is \`ACTIVE\`.

### Plan snapshot

\`planSnapshot\` represents the subscription plan as it existed when this subscription was activated.

Later edits to the associated SubscriptionPlan do not change this snapshot.

This preserves historical information including:

- title
- description
- tier
- tags
- duration
- price
- discount
- enabled features
`,

  security: lawyerSecurity,

  responses: {
    200: {
      description: "Current lawyer subscription returned successfully.",

      content: {
        "application/json": {
          schema: CurrentLawyerSubscriptionSuccessSchema,
        },
      },
    },

    401: unauthorizedResponse,

    403: forbiddenResponse,

    500: serverErrorResponse,
  },
});
