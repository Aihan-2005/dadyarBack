import { openApiRegistry } from "../openapi.registry";

import {
  ApiErrorSchema,
  CreateSubscriptionPaymentSuccessSchema,
  LawyerPaymentListSuccessSchema,
  LawyerPaymentSuccessSchema,
} from "../schemas/payment.openapi.schemas";

import {
  CreateSubscriptionPaymentSchema,
  PaymentHistoryQuerySchema,
  PaymentIdParamSchema,
  ZarinPalCallbackQuerySchema,
} from "../../validators/payment.validator";

const lawyerSecurity = [
  {
    bearerAuth: [],
  },
];

const badRequestResponse = {
  description: "The submitted request or parameters are invalid.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

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
    "The authenticated account is not permitted to perform this payment operation.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const notFoundResponse = {
  description: "The requested payment or subscription plan was not found.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const conflictResponse = {
  description:
    "The requested payment operation conflicts with the current subscription state.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const providerErrorResponse = {
  description:
    "The payment provider could not complete or verify the requested operation.",

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
// POST /payments/subscriptions
// ========================================================

openApiRegistry.registerPath({
  method: "post",

  path: "/payments/subscriptions",

  operationId: "createSubscriptionPayment",

  tags: ["Payments"],

  summary: "Start a subscription payment",

  description: `
Creates a new payment attempt for the authenticated lawyer to purchase a subscription plan.

...

A local \`PENDING\` Payment record is created before requesting a ZarinPal authority.

### Existing pending checkout

Only one unresolved \`PENDING\` subscription payment may exist for a lawyer at a time.

If the lawyer requests checkout again for the same plan while a previous payment is still pending, the backend may reuse the existing payment attempt and its ZarinPal authority instead of creating another chargeable payment.

This prevents repeated clicks or concurrent checkout requests from producing multiple payable gateway sessions.

If the existing pending payment belongs to a different plan, the new checkout request is rejected with:

\`409 Conflict\`

until the existing payment reaches a terminal state such as:

- \`PAID\`
- \`FAILED\`
- \`CANCELLED\`
- \`REVERSED\`

The database also enforces this rule with a unique partial index so concurrent HTTP requests cannot create multiple pending payments for the same lawyer.

On success the response contains:

- \`paymentId\` — the local Payment ID
- \`redirectUrl\` — the ZarinPal gateway URL
- \`amount\`
- \`currency\`

The frontend should redirect the browser to \`redirectUrl\`.

Creating the payment attempt does **not** activate a subscription.

Subscription activation occurs only after successful provider verification.
`,

  security: lawyerSecurity,

  request: {
    body: {
      required: true,

      content: {
        "application/json": {
          schema: CreateSubscriptionPaymentSchema,
        },
      },
    },
  },

  responses: {
    201: {
      description: "Payment attempt created successfully.",

      content: {
        "application/json": {
          schema: CreateSubscriptionPaymentSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    403: forbiddenResponse,

    404: notFoundResponse,

    409: conflictResponse,

    502: providerErrorResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// GET /payments
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/payments",

  operationId: "listLawyerPayments",

  tags: ["Payments"],

  summary: "List the authenticated lawyer's payments",

  description: `
Returns paginated payment history belonging only to the authenticated lawyer.

The User must have role:

\`LAWYER\`

The endpoint intentionally does not require an active lawyer profile because financial history remains accessible even if the professional profile later changes state.

Results are ordered newest first.

The optional \`status\` query parameter filters by financial payment status.

Payment status describes the **money side** of the transaction.

Fulfillment status describes whether the purchased subscription was successfully delivered.

For example:

\`PAID + FULFILLED\`

means the provider confirmed payment and the subscription was activated.

\`PAID + REQUIRES_ACTION\`

means payment succeeded but subscription activation requires recovery or administrative action.
`,

  security: lawyerSecurity,

  request: {
    query: PaymentHistoryQuerySchema,
  },

  responses: {
    200: {
      description: "Payment history returned successfully.",

      content: {
        "application/json": {
          schema: LawyerPaymentListSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    403: forbiddenResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// GET /payments/{id}
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/payments/{id}",

  operationId: "getLawyerPayment",

  tags: ["Payments"],

  summary: "Get one payment belonging to the authenticated lawyer",

  description: `
Returns one payment owned by the authenticated lawyer.

The endpoint performs an ownership check using both:

- payment ID
- authenticated lawyer ID

A payment belonging to another lawyer is treated as not found.

This prevents callers from using payment identifiers to discover another lawyer's financial records.
`,

  security: lawyerSecurity,

  request: {
    params: PaymentIdParamSchema,
  },

  responses: {
    200: {
      description: "Payment returned successfully.",

      content: {
        "application/json": {
          schema: LawyerPaymentSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    403: forbiddenResponse,

    404: notFoundResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// GET /payments/zarinpal/callback
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/payments/zarinpal/callback",

  operationId: "handleZarinPalPaymentCallback",

  tags: ["Payments"],

  summary: "Handle the ZarinPal browser callback",

  description: `
Public callback used by ZarinPal after the user returns from the payment gateway.

Authentication is not required.

The callback itself is **not trusted as proof of payment**.

### NOK callback status

A callback whose:

\`Status=NOK\`

does not by itself establish a terminal financial result.

The Payment therefore remains:

\`PENDING\`

rather than immediately being marked \`CANCELLED\`.

This keeps the payment recoverable if:

- a later callback reports success
- verification was delayed
- administrative reconciliation discovers that the provider has a different final transaction state

A pending payment can later be reconciled against ZarinPal through the administration payment reconciliation flow.

When \`Status=OK\`, the backend loads the Payment using the supplied authority and verifies the transaction directly with ZarinPal using the amount stored in the Payment record.

If payment verification succeeds, the backend transactionally:

- records the payment as paid
- attempts subscription activation
- records fulfillment state

After processing, the browser receives an HTTP 303 redirect to the configured frontend payment-result URL.

The frontend receives only the local \`paymentId\` and should request:

\`GET /payments/{id}\`

to obtain the authoritative payment state.
`,

  request: {
    query: ZarinPalCallbackQuerySchema,
  },

  responses: {
    303: {
      description:
        "Payment callback processed and browser redirected to the frontend payment-result page.",

      headers: {
        Location: {
          description:
            "Frontend payment-result URL containing the local paymentId.",

          schema: {
            type: "string",
            format: "uri",
          },
        },
      },
    },

    400: badRequestResponse,

    404: notFoundResponse,

    502: providerErrorResponse,

    500: serverErrorResponse,
  },
});
