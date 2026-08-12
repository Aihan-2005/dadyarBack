import { openApiRegistry } from "../openapi.registry";

import {
  ApiErrorSchema,
  CaseDeleteSuccessSchema,
  CaseDetailsSuccessSchema,
  CaseListSuccessSchema,
} from "../schemas/case.openapi.schemas";

import {
  AddAssistantLawyerSchema,
  AddOpposingLawyerSchema,
  AddOpposingPartySchema,
  AddRelatedPersonSchema,
  CreateCaseSchema,
  ListCasesQuerySchema,
  ParamCaseAndAssistantLawyerIdSchema,
  ParamCaseAndOpposingLawyerIdSchema,
  ParamCaseAndOpposingPartyIdSchema,
  ParamCaseAndRelatedPersonIdSchema,
  ParamCaseIdSchema,
  UpdateAssistantLawyerSchema,
  UpdateCaseSchema,
  UpdateCaseStateSchema,
  UpdateCourtSchema,
  UpdateOpposingLawyerSchema,
  UpdateOpposingPartySchema,
  UpdateRelatedPersonSchema,
} from "../../validators/case.validator";

// ========================================================
// Shared responses
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
  description: "The request is invalid.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const notFoundResponse = {
  description: "The case or requested case resource was not found.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const conflictResponse = {
  description: "The request conflicts with an existing resource.",

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
// Cases
// ========================================================

// --------------------------------------------------------
// POST /cases
// --------------------------------------------------------

openApiRegistry.registerPath({
  method: "post",

  path: "/cases",

  operationId: "createCase",

  tags: ["Cases"],

  summary: "Create a case",

  description: `
Creates a new case for the authenticated lawyer.

The authenticated lawyer is resolved exclusively from the access token.
The request body must not contain lawyerId or other lawyer-account fields.

### Clients

Clients are submitted through \`clients[]\`.

There are two supported client modes.

#### Existing client

If the client already exists in the authenticated lawyer's client database:

\`\`\`json
{
  "clientId": "MongoObjectId",
  "assignedAmount": 5000000,
  "role": "خواهان"
}
\`\`\`

The backend verifies that the client belongs to the authenticated lawyer.

#### New or manually entered client

A client can also be resolved using a phone number:

\`\`\`json
{
  "fullName": "علی رضایی",
  "phone": "09121234567",
  "nationalId": "1234567890",
  "assignedAmount": 5000000
}
\`\`\`

If a client with that phone already exists for the authenticated lawyer,
the existing client is reused.

Otherwise, a new client is created.

A client is never duplicated inside the same case.

The sum of all client \`assignedAmount\` values must exactly equal the case \`value\`.

### Payments

Payments belong to a specific case client and are submitted inside:

\`clients[].payments[]\`

Supported methods:

- CASH
- NON_CASH

Rules:

- payments without \`paymentId\` are created
- NON_CASH payments require a description
- a client's scheduled payment total cannot exceed that client's assigned amount

### Expenses

Case expenses are submitted using the top-level \`expenses[]\` array.

### Transaction

Case creation, optional client creation, assignments, payments, and expenses
are executed inside a MongoDB transaction.

If one operation fails, the transaction is rolled back.
`,

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    body: {
      required: true,

      content: {
        "application/json": {
          schema: CreateCaseSchema,
        },
      },
    },
  },

  responses: {
    201: {
      description: "Case created successfully.",

      content: {
        "application/json": {
          schema: CaseDetailsSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    409: conflictResponse,

    500: serverErrorResponse,
  },
});

// --------------------------------------------------------
// GET /cases
// --------------------------------------------------------

openApiRegistry.registerPath({
  method: "get",

  path: "/cases",

  operationId: "listCases",

  tags: ["Cases"],

  summary: "List cases",

  description: `
Returns the authenticated lawyer's cases using database-level pagination.

The optional \`search\` value searches:

- case title
- case number
- court province
- court city

The endpoint returns the same normalized case representation used by
the case-details endpoint.

Each returned case includes:

- resolved clients
- each client's assigned attorney-fee amount
- each client's payments
- case expenses
- opposing parties
- assistant lawyers
- opposing lawyers
- related people

Payments and expenses are batch-loaded for all cases in the current page,
avoiding an N+1 query pattern.

The response never exposes the case owner's lawyerId.
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
      description: "Cases returned successfully.",

      content: {
        "application/json": {
          schema: CaseListSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    500: serverErrorResponse,
  },
});

// --------------------------------------------------------
// GET /cases/{caseId}
// --------------------------------------------------------

openApiRegistry.registerPath({
  method: "get",

  path: "/cases/{caseId}",

  operationId: "getCaseById",

  tags: ["Cases"],

  summary: "Get case details",

  description:
    "Returns the complete case including resolved clients, each client's payments, and case expenses.",

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
      description: "Case returned successfully.",

      content: {
        "application/json": {
          schema: CaseDetailsSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    404: notFoundResponse,

    500: serverErrorResponse,
  },
});

// --------------------------------------------------------
// PATCH /cases/{caseId}
// --------------------------------------------------------

openApiRegistry.registerPath({
  method: "patch",

  path: "/cases/{caseId}",

  operationId: "updateCase",

  tags: ["Cases"],

  summary: "Update a case",

  description: `
Partially updates a case.

Only supplied fields are changed.

### Clients and payments

If \`clients\` is omitted, existing client assignments and payments remain unchanged.

If \`clients\` is supplied, it represents the desired client assignment state.

For each client's \`payments\`:

- omitted \`payments\` → existing payments remain unchanged
- \`payments: []\` → remove all payments for that client
- payment with \`paymentId\` → update existing payment
- payment without \`paymentId\` → create new payment
- an existing payment omitted from a submitted payment list → delete it

The sum of client assignments must equal the case value.

### Expenses

- omitted \`expenses\` → existing expenses remain unchanged
- \`expenses: []\` → delete all case expenses
- expense with \`expenseId\` → update existing expense
- expense without \`expenseId\` → create new expense
- an existing expense omitted from the submitted array → delete it

The update operation is transactional.
`,

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: ParamCaseIdSchema,

    body: {
      required: true,

      content: {
        "application/json": {
          schema: UpdateCaseSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Case updated successfully.",

      content: {
        "application/json": {
          schema: CaseDetailsSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    404: notFoundResponse,

    409: conflictResponse,

    500: serverErrorResponse,
  },
});

// --------------------------------------------------------
// DELETE /cases/{caseId}
// --------------------------------------------------------

openApiRegistry.registerPath({
  method: "delete",

  path: "/cases/{caseId}",

  operationId:
    "deleteCase",

  tags: [
    "Cases",
  ],

  summary:
    "Delete a case",

  description: `
Deletes a case owned by the authenticated lawyer.

The operation is transactional.

The following case-owned resources are deleted:

- the Case document
- all CasePayment documents belonging to the case
- all CaseExpense documents belonging to the case

Client documents are NOT deleted.

Clients are independent lawyer-owned entities and may be connected
to other cases.
`,

  security: [
    {
      bearerAuth:
        [],
    },
  ],

  request: {
    params:
      ParamCaseIdSchema,
  },

  responses: {
    200: {
      description:
        "Case deleted successfully.",

      content: {
        "application/json": {
          schema:
            CaseDeleteSuccessSchema,
        },
      },
    },

    400:
      badRequestResponse,

    401:
      unauthorizedResponse,

    404:
      notFoundResponse,

    500:
      serverErrorResponse,
  },
});

// --------------------------------------------------------
// PATCH /cases/{caseId}/state
// --------------------------------------------------------

openApiRegistry.registerPath({
  method: "patch",

  path: "/cases/{caseId}/state",

  operationId: "updateCaseState",

  tags: ["Cases"],

  summary: "Update case state",

  description: "Updates only the state of a case.",

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: ParamCaseIdSchema,

    body: {
      required: true,

      content: {
        "application/json": {
          schema: UpdateCaseStateSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Case state updated successfully.",

      content: {
        "application/json": {
          schema: CaseDetailsSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    404: notFoundResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// Court
// ========================================================

openApiRegistry.registerPath({
  method: "patch",

  path: "/cases/{caseId}/court",

  operationId: "updateCaseCourt",

  tags: ["Cases - Court"],

  summary: "Update case court",

  description:
    "Partially updates the court information associated with a case.",

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: ParamCaseIdSchema,

    body: {
      required: true,

      content: {
        "application/json": {
          schema: UpdateCourtSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Court updated successfully.",

      content: {
        "application/json": {
          schema: CaseDetailsSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    404: notFoundResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// Opposing Parties
// ========================================================

// POST

openApiRegistry.registerPath({
  method: "post",

  path: "/cases/{caseId}/opposing-parties",

  operationId: "addOpposingParty",

  tags: ["Cases - Opposing Parties"],

  summary: "Add opposing party",

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: ParamCaseIdSchema,

    body: {
      required: true,

      content: {
        "application/json": {
          schema: AddOpposingPartySchema,
        },
      },
    },
  },

  responses: {
    201: {
      description: "Opposing party added successfully.",

      content: {
        "application/json": {
          schema: CaseDetailsSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    404: notFoundResponse,
  },
});

// PATCH

openApiRegistry.registerPath({
  method: "patch",

  path: "/cases/{caseId}/opposing-parties/{opposingPartyId}",

  operationId: "updateOpposingParty",

  tags: ["Cases - Opposing Parties"],

  summary: "Update opposing party",

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: ParamCaseAndOpposingPartyIdSchema,

    body: {
      required: true,

      content: {
        "application/json": {
          schema: UpdateOpposingPartySchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Opposing party updated successfully.",

      content: {
        "application/json": {
          schema: CaseDetailsSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    404: notFoundResponse,
  },
});

// DELETE

openApiRegistry.registerPath({
  method: "delete",

  path: "/cases/{caseId}/opposing-parties/{opposingPartyId}",

  operationId: "removeOpposingParty",

  tags: ["Cases - Opposing Parties"],

  summary: "Remove opposing party",

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: ParamCaseAndOpposingPartyIdSchema,
  },

  responses: {
    200: {
      description: "Opposing party removed successfully.",

      content: {
        "application/json": {
          schema: CaseDetailsSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    404: notFoundResponse,
  },
});

// ========================================================
// Assistant Lawyers
// ========================================================

openApiRegistry.registerPath({
  method: "post",

  path: "/cases/{caseId}/assistant-lawyers",

  operationId: "addAssistantLawyer",

  tags: ["Cases - Assistant Lawyers"],

  summary: "Add assistant lawyer",

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: ParamCaseIdSchema,

    body: {
      required: true,

      content: {
        "application/json": {
          schema: AddAssistantLawyerSchema,
        },
      },
    },
  },

  responses: {
    201: {
      description: "Assistant lawyer added successfully.",

      content: {
        "application/json": {
          schema: CaseDetailsSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    404: notFoundResponse,
  },
});

openApiRegistry.registerPath({
  method: "patch",

  path: "/cases/{caseId}/assistant-lawyers/{assistantLawyerId}",

  operationId: "updateAssistantLawyer",

  tags: ["Cases - Assistant Lawyers"],

  summary: "Update assistant lawyer",

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: ParamCaseAndAssistantLawyerIdSchema,

    body: {
      required: true,

      content: {
        "application/json": {
          schema: UpdateAssistantLawyerSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Assistant lawyer updated successfully.",

      content: {
        "application/json": {
          schema: CaseDetailsSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    404: notFoundResponse,
  },
});

openApiRegistry.registerPath({
  method: "delete",

  path: "/cases/{caseId}/assistant-lawyers/{assistantLawyerId}",

  operationId: "removeAssistantLawyer",

  tags: ["Cases - Assistant Lawyers"],

  summary: "Remove assistant lawyer",

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: ParamCaseAndAssistantLawyerIdSchema,
  },

  responses: {
    200: {
      description: "Assistant lawyer removed successfully.",

      content: {
        "application/json": {
          schema: CaseDetailsSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    404: notFoundResponse,
  },
});

// ========================================================
// Opposing Lawyers
// ========================================================

openApiRegistry.registerPath({
  method: "post",

  path: "/cases/{caseId}/opposing-lawyers",

  operationId: "addOpposingLawyer",

  tags: ["Cases - Opposing Lawyers"],

  summary: "Add opposing lawyer",

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: ParamCaseIdSchema,

    body: {
      required: true,

      content: {
        "application/json": {
          schema: AddOpposingLawyerSchema,
        },
      },
    },
  },

  responses: {
    201: {
      description: "Opposing lawyer added successfully.",

      content: {
        "application/json": {
          schema: CaseDetailsSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    404: notFoundResponse,
  },
});

openApiRegistry.registerPath({
  method: "patch",

  path: "/cases/{caseId}/opposing-lawyers/{opposingLawyerId}",

  operationId: "updateOpposingLawyer",

  tags: ["Cases - Opposing Lawyers"],

  summary: "Update opposing lawyer",

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: ParamCaseAndOpposingLawyerIdSchema,

    body: {
      required: true,

      content: {
        "application/json": {
          schema: UpdateOpposingLawyerSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Opposing lawyer updated successfully.",

      content: {
        "application/json": {
          schema: CaseDetailsSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    404: notFoundResponse,
  },
});

openApiRegistry.registerPath({
  method: "delete",

  path: "/cases/{caseId}/opposing-lawyers/{opposingLawyerId}",

  operationId: "removeOpposingLawyer",

  tags: ["Cases - Opposing Lawyers"],

  summary: "Remove opposing lawyer",

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: ParamCaseAndOpposingLawyerIdSchema,
  },

  responses: {
    200: {
      description: "Opposing lawyer removed successfully.",

      content: {
        "application/json": {
          schema: CaseDetailsSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    404: notFoundResponse,
  },
});

// ========================================================
// Related People
// ========================================================

openApiRegistry.registerPath({
  method: "post",

  path: "/cases/{caseId}/related-people",

  operationId: "addRelatedPerson",

  tags: ["Cases - Related People"],

  summary: "Add related person",

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: ParamCaseIdSchema,

    body: {
      required: true,

      content: {
        "application/json": {
          schema: AddRelatedPersonSchema,
        },
      },
    },
  },

  responses: {
    201: {
      description: "Related person added successfully.",

      content: {
        "application/json": {
          schema: CaseDetailsSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    404: notFoundResponse,
  },
});

openApiRegistry.registerPath({
  method: "patch",

  path: "/cases/{caseId}/related-people/{relatedPersonId}",

  operationId: "updateRelatedPerson",

  tags: ["Cases - Related People"],

  summary: "Update related person",

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: ParamCaseAndRelatedPersonIdSchema,

    body: {
      required: true,

      content: {
        "application/json": {
          schema: UpdateRelatedPersonSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Related person updated successfully.",

      content: {
        "application/json": {
          schema: CaseDetailsSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    404: notFoundResponse,
  },
});

openApiRegistry.registerPath({
  method: "delete",

  path: "/cases/{caseId}/related-people/{relatedPersonId}",

  operationId: "removeRelatedPerson",

  tags: ["Cases - Related People"],

  summary: "Remove related person",

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: ParamCaseAndRelatedPersonIdSchema,
  },

  responses: {
    200: {
      description: "Related person removed successfully.",

      content: {
        "application/json": {
          schema: CaseDetailsSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    404: notFoundResponse,
  },
});
