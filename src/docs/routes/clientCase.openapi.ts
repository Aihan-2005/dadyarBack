import { openApiRegistry } from "../openapi.registry";

import {
  ClientCaseDetailsSuccessSchema,
  ClientCaseListSuccessSchema,
  ClientCasePaymentsSuccessSchema,
} from "../schemas/clientCase.openapi.schemas";

import { ApiErrorSchema } from "../schemas/common.openapi";

import {
  ListCasesQuerySchema,
  ParamCaseIdSchema,
} from "../../validators/case.validator";

// ========================================================
// Shared Responses
// ========================================================

const badRequestResponse = {
  description: "The request is invalid.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const unauthorizedResponse = {
  description: "Authentication is required.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const forbiddenResponse = {
  description: "The authenticated user must have the CLIENT role.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const notFoundResponse = {
  description:
    "The case was not found or is not accessible to the authenticated client.",

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
// GET /client/cases
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/client/cases",

  operationId: "listClientCases",

  tags: ["Client Cases"],

  summary: "List the authenticated client's cases",

  description: `
Returns cases associated with the authenticated CLIENT account.

The authenticated User is linked to one or more lawyer-owned LawyerClient
records through \`LawyerClient.userId\`.

A case is visible only when one of those LawyerClient records appears in
the case's client assignments.

This means a CLIENT may see cases belonging to multiple lawyers when the
same verified client account has been linked to LawyerClient records owned
by different lawyers.

### Visibility

The response is intentionally limited to client-visible information.

Each case includes:

- basic case information
- case state
- court and branch-history information
- basic lawyer information
- only the authenticated client's own assignment information

The response does not expose:

- other clients assigned to the case
- other clients' contact or identity information
- other clients' payments
- lawyer-only case expenses
- internal LawyerClient userId links

### Lawyer

Each case contains basic information about the lawyer responsible for it:

- id
- firstName
- lastName
- specialization

### Search and pagination

The endpoint supports the same read filters used by case listing:

- \`state\`
- \`search\`
- \`page\`
- \`limit\`

The search value may match case numbers, titles, archive numbers,
and supported court fields.

### Authorization

A valid access token is required and the authenticated User must have
the CLIENT role.
`,

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    query: ListCasesQuerySchema,
  },

  responses: {
    200: {
      description: "Client cases returned successfully.",

      content: {
        "application/json": {
          schema: ClientCaseListSuccessSchema,
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
// GET /client/cases/{caseId}/payments
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/client/cases/{caseId}/payments",

  operationId: "getClientCasePayments",

  tags: ["Client Cases"],

  summary: "Get the authenticated client's payments for a case",

  description: `
Returns only the payments belonging to the authenticated CLIENT's own
assignment in the requested case.

Access is resolved through:

1. the authenticated User
2. LawyerClient records linked through \`userId\`
3. the requested case's client assignments
4. CasePayment records matching that specific LawyerClient assignment

A CLIENT cannot use this endpoint to retrieve another client's payments,
even when both clients belong to the same case.

### Returned payment information

Each payment may include:

- paymentId
- method
- amount
- description
- dueDate
- isPaid
- createdAt
- updatedAt

The response does not expose internal lawyerId or clientId fields.

### Not found behavior

If the case does not exist or does not belong to one of the authenticated
CLIENT's linked LawyerClient records, the endpoint returns
\`404 CASE_NOT_FOUND\`.

This avoids revealing the existence of cases that the authenticated
CLIENT cannot access.

### Authorization

A valid access token is required and the authenticated User must have
the CLIENT role.
`,

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: ParamCaseIdSchema,
  },

  responses: {
    200: {
      description: "Client case payments returned successfully.",

      content: {
        "application/json": {
          schema: ClientCasePaymentsSuccessSchema,
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
// GET /client/cases/{caseId}
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/client/cases/{caseId}",

  operationId: "getClientCaseById",

  tags: ["Client Cases"],

  summary: "Get a case accessible to the authenticated client",

  description: `
Returns one case associated with the authenticated CLIENT account.

The case is accessible only when its client assignments contain a
LawyerClient record linked to the authenticated User.

The response contains only the authenticated client's own assignment.
Information belonging to other clients is not exposed.

### Client-visible case information

The response may include:

- caseId
- lawyer
- title
- caseNumber
- archiveNumberOffice
- state
- description
- court
- branchHistory
- paymentType
- nonCashDescription
- the authenticated client's assignment
- createdAt
- updatedAt

### Lawyer information

The \`lawyer\` object contains:

- id
- firstName
- lastName
- specialization

### Assignment

The \`assignment\` object represents only the authenticated CLIENT's
LawyerClient assignment and may contain:

- lawyerClientId
- assignedAmount
- birthDate
- role
- represent

### Not found behavior

If the case does not exist or is not associated with one of the
authenticated User's linked LawyerClient records, the endpoint returns
\`404 CASE_NOT_FOUND\`.

### Authorization

A valid access token is required and the authenticated User must have
the CLIENT role.
`,

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: ParamCaseIdSchema,
  },

  responses: {
    200: {
      description: "Client case returned successfully.",

      content: {
        "application/json": {
          schema: ClientCaseDetailsSuccessSchema,
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
