import { openApiRegistry } from "../openapi.registry";

import {
  ApiErrorSchema,
  FAQListSuccessSchema,
  FAQSuccessSchema,
} from "../schemas/faq.openapi.schemas";

import {
  CreateFAQSchema,
  ListFAQSchema,
  ParamFAQIdSchema,
} from "../../validators/faq.validator";

// ========================================================
// Shared Security
// ========================================================

const adminSecurity = [
  {
    bearerAuth: [],
  },
];

// ========================================================
// Shared Responses
// ========================================================

const badRequestResponse = {
  description:
    "The submitted request, query parameters, route parameters, or request body are invalid.",

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
    "The authenticated account is not permitted to perform this operation. FAQ creation and deletion require an ADMIN account.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const notFoundResponse = {
  description: "The requested FAQ was not found.",

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
// GET /faq
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/faq",

  operationId: "listFAQs",

  tags: ["FAQ"],

  summary: "List frequently asked questions",

  description: `
Returns a public paginated list of frequently asked questions.

Authentication is **not required**.

Results are ordered by:

\`updatedAt DESC\`

so the most recently updated FAQ entries appear first.

### Search

The optional \`search\` query parameter performs a case-insensitive search across both:

- FAQ question
- FAQ answer

For example:

\`\`\`http
GET /faq?search=password
\`\`\`

may match an FAQ whose question or answer contains the word \`password\`.

Search text is escaped before being used as a MongoDB regular expression.

This means special regular-expression input such as:

\`.*\`

is treated as literal text rather than as a wildcard matching every FAQ.

### Pagination

Supported pagination parameters:

- \`page\`
- \`limit\`

Defaults:

- \`page = 1\`
- \`limit = 20\`

Maximum:

- \`limit = 100\`

The response includes pagination metadata:

- current page
- page size
- total number of FAQ records matching the active search
- total page count

### Examples

List the first page:

\`\`\`http
GET /faq
\`\`\`

Search FAQs:

\`\`\`http
GET /faq?search=payment
\`\`\`

Search with explicit pagination:

\`\`\`http
GET /faq?search=payment&page=2&limit=10
\`\`\`
`,

  request: {
    query: ListFAQSchema,
  },

  responses: {
    200: {
      description: "FAQ entries returned successfully.",

      content: {
        "application/json": {
          schema: FAQListSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// POST /faq
// ========================================================

openApiRegistry.registerPath({
  method: "post",

  path: "/faq",

  operationId: "createFAQ",

  tags: ["FAQ"],

  summary: "Create a frequently asked question",

  description: `
Creates a new FAQ entry.

This endpoint requires:

\`Authorization: Bearer <accessToken>\`

and the authenticated User must have role:

\`ADMIN\`

Normal CLIENT and LAWYER accounts cannot create FAQ entries.

### Request body

Both fields are required:

- \`question\`
- \`answer\`

The values are validated using the same FAQ creation schema used by the runtime endpoint.

### Example

\`\`\`json
{
  "question": "How can I change my password?",
  "answer": "You can change your password from your account settings."
}
\`\`\`

The created FAQ is returned with its MongoDB identifier and timestamps.
`,

  security: adminSecurity,

  request: {
    body: {
      required: true,

      content: {
        "application/json": {
          schema: CreateFAQSchema,
        },
      },
    },
  },

  responses: {
    201: {
      description: "FAQ created successfully.",

      content: {
        "application/json": {
          schema: FAQSuccessSchema,
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
// DELETE /faq/{id}
// ========================================================

openApiRegistry.registerPath({
  method: "delete",

  path: "/faq/{id}",

  operationId: "deleteFAQ",

  tags: ["FAQ"],

  summary: "Delete a frequently asked question",

  description: `
Deletes one FAQ entry by its MongoDB ObjectId.

This endpoint requires:

\`Authorization: Bearer <accessToken>\`

and the authenticated User must have role:

\`ADMIN\`.

CLIENT and LAWYER accounts cannot delete FAQ entries.

### Resource lookup

The \`id\` route parameter must be a valid MongoDB ObjectId.

If the ID format is invalid, the request is rejected as a validation error.

If the ID is valid but no FAQ exists with that ID, the endpoint returns:

\`404 FAQ_NOT_FOUND\`

### Successful deletion

The deleted FAQ record is returned in the response.

This allows the admin frontend to know exactly which FAQ was removed.
`,

  security: adminSecurity,

  request: {
    params: ParamFAQIdSchema,
  },

  responses: {
    200: {
      description: "FAQ deleted successfully.",

      content: {
        "application/json": {
          schema: FAQSuccessSchema,
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
