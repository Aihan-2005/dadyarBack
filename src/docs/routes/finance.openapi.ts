import { openApiRegistry } from "../openapi.registry";

import {
  ApiErrorSchema,
  ClientCaseFinancialReportSuccessSchema,
  ClientFinancialReportSuccessSchema,
  LawyerFinancialSummarySuccessSchema,
} from "../schemas/finance.openapi.schemas";

import {
  FinancialClientCasesQuerySchema,
  FinancialClientIdParamSchema,
  FinancialClientReportQuerySchema,
} from "../../validators/financialReport.validator";

// ========================================================
// Shared Responses
// ========================================================

const unauthorizedResponse = {
  description: "Authentication is required.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const badRequestResponse = {
  description: "The request parameters are invalid.",

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
// GET /finance/summary
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/finance/summary",

  operationId: "getFinancialSummary",

  tags: ["Financial Reports"],

  summary: "Get financial summary",

  description: `
Returns the overall financial status for the authenticated lawyer.

### Calculated values

- \`totalCaseValue\`: sum of the cash/contract \`value\` of all cases.
- \`totalEstimatedNonCashValue\`: sum of \`estimatedPrice\` for \`NON_CASH\` and \`BOTH\` cases. This is informational and is not treated as cash received.
- \`totalTrackedValue\`: \`totalCaseValue + totalEstimatedNonCashValue\`, for visibility into tracked cash plus estimated non-cash value.
- \`nonCashCaseCount\`: number of cases whose payment type is \`NON_CASH\` or \`BOTH\`.
- \`totalPaidPayments\`: sum of all client payments where \`isPaid = true\`.
- \`totalOverduePayments\`: sum of unpaid payments whose \`dueDate\` is before the current time.
- \`totalExpenses\`: sum of all case expenses, whether paid or unpaid.
- \`totalPaidExpenses\`: sum of expenses where \`isPaid = true\`.
- \`remainingReceivable\`: \`max(totalCaseValue - totalPaidPayments, 0)\`. Estimated non-cash value is intentionally excluded from this receivable calculation.
- \`netReceived\`: \`totalPaidPayments - totalPaidExpenses\`.
- \`collectionRate\`: percentage of total case value that has been paid.

All calculations are scoped to the authenticated lawyer.
`,

  security: [
    {
      bearerAuth: [],
    },
  ],

  responses: {
    200: {
      description: "Financial summary returned successfully.",

      content: {
        "application/json": {
          schema: LawyerFinancialSummarySuccessSchema,
        },
      },
    },

    401: unauthorizedResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// GET /finance/clients
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/finance/clients",

  operationId: "getClientFinancialReport",

  tags: ["Financial Reports"],

  summary: "List client financial summaries",

  description: `
Returns a paginated financial summary for the authenticated lawyer's clients.

Each client includes aggregated financial information across all cases assigned to that client.

### Calculated values

- \`caseCount\`: number of cases assigned to the client.
- \`nonCashCaseCount\`: number of related cases whose payment type is \`NON_CASH\` or \`BOTH\`.
- \`relatedEstimatedNonCashValue\`: sum of estimated non-cash value for the client's related cases. This is contextual and is not added to receivables.
- \`assignedAmount\`: total amount assigned to the client across all cases.
- \`paidAmount\`: total payments where \`isPaid = true\`.
- \`remainingAmount\`: \`assignedAmount - paidAmount\`.
- \`overdueAmount\`: unpaid payments whose \`dueDate\` is before the current time.
- \`collectionRate\`: percentage of the assigned amount that has been paid.

### Search

The optional \`search\` parameter searches:

- client full name
- phone number
- national ID

Clients are paginated before the financial lookups are performed.

A client with no assigned cases can still appear with zero financial values.
`,

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    query: FinancialClientReportQuerySchema,
  },

  responses: {
    200: {
      description: "Client financial summaries returned successfully.",

      content: {
        "application/json": {
          schema: ClientFinancialReportSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// GET /finance/clients/{clientId}/cases
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/finance/clients/{clientId}/cases",

  operationId: "getClientCaseFinancialReport",

  tags: ["Financial Reports"],

  summary: "Get client financial details by case",

  description: `
Returns the authenticated lawyer's financial relationship with one client, broken down by case.

Each case includes the client's assignment amount, payment totals, overdue amount, collection rate, payment type, estimated non-cash value, and the complete payment list for that client in that case.

### Per-case calculations

- \`caseValue\`: cash/contract value of the case.
- \`paymentType\`: \`CASH\`, \`NON_CASH\`, or \`BOTH\`.
- \`estimatedNonCashValue\`: the case's \`estimatedPrice\` when payment type is \`NON_CASH\` or \`BOTH\`; otherwise \`0\`.
- \`nonCashDescription\`: description of the non-cash consideration, when provided.
- \`assignedAmount\`: the portion of the case value assigned to this client.
- \`paidAmount\`: sum of this client's paid payments for this case.
- \`remainingAmount\`: \`assignedAmount - paidAmount\`.
- \`overdueAmount\`: this client's unpaid payments for the case whose \`dueDate\` is before the current time.
- \`collectionRate\`: percentage of this client's assigned amount that has been paid.

### Payments

The \`payments[]\` array contains the actual payment schedule for the client in each case, including:

- payment ID
- payment method
- amount
- description
- due date
- paid status

### Filters

The optional \`paymentType\` query parameter can be used to return only \`CASH\`, \`NON_CASH\`, or \`BOTH\` cases for this client.

Only cases that belong to the authenticated lawyer and contain the specified client are returned.

A valid client ID with no matching assigned cases currently returns an empty paginated result rather than a 404 response.
`,

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: FinancialClientIdParamSchema,

    query: FinancialClientCasesQuerySchema,
  },

  responses: {
    200: {
      description: "Client case financial details returned successfully.",

      content: {
        "application/json": {
          schema: ClientCaseFinancialReportSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    500: serverErrorResponse,
  },
});