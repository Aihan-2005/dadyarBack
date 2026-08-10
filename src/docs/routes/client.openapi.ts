import { openApiRegistry } from "../openapi.registry";

import {
  ApiErrorSchema,
  ClientListSuccessSchema,
  ClientLookupSuccessSchema,
  ClientSuccessSchema,
} from "../schemas/client.openapi.schemas";

import {
  ClientPhoneQuerySchema,
  CreateClientSchema,
  ListClientsQuerySchema,
  ParamClientIdSchema,
  UpdateClientSchema,
} from "../../validators/client.validator";

// ========================================================
// Shared Responses
// ========================================================

const badRequestResponse = {
  description: "The submitted request is invalid.",

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

const notFoundResponse = {
  description: "The client was not found.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const conflictResponse = {
  description:
    "Another client already uses the submitted phone number or national ID.",

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
// POST /clients
// ========================================================

openApiRegistry.registerPath({
  method: "post",

  path: "/clients",

  operationId: "createClient",

  tags: ["Clients"],

  summary: "Create a client",

  description: `
Creates a client for the authenticated lawyer.

Client identity is scoped to the authenticated lawyer.

### Uniqueness rules

For one lawyer:

- the same phone number cannot belong to multiple clients
- a provided national ID cannot belong to multiple clients

Phone numbers and national IDs are normalized before being stored.

Optional empty values are normalized by the backend.
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
          schema: CreateClientSchema,
        },
      },
    },
  },

  responses: {
    201: {
      description: "Client created successfully.",

      content: {
        "application/json": {
          schema: ClientSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    409: conflictResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// GET /clients
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/clients",

  operationId: "listClients",

  tags: ["Clients"],

  summary: "List clients",

  description: `
Returns a paginated list of clients belonging to the authenticated lawyer.

### Search

The optional \`search\` parameter searches the following client fields:

- full name
- phone number
- national ID
- home number

Results are ordered by most recently updated first.

This response is returned with caching disabled.
`,

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    query: ListClientsQuerySchema,
  },

  responses: {
    200: {
      description: "Clients returned successfully.",

      headers: {
        "Cache-Control": {
          description: "Caching is disabled for client data.",

          schema: {
            type: "string",

            example: "no-store",
          },
        },
      },

      content: {
        "application/json": {
          schema: ClientListSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// GET /clients/lookup
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/clients/lookup",

  operationId: "lookupClientByPhone",

  tags: ["Clients"],

  summary: "Lookup client by phone",

  description: `
Looks up one client belonging to the authenticated lawyer using a phone number.

This endpoint is useful while creating or editing a case to determine whether the entered phone number already belongs to an existing client.

If no matching client exists, the endpoint does **not** return 404.

Instead it returns:

\`\`\`json
{
  "success": true,
  "data": null
}
\`\`\`

Phone digits are normalized before lookup, including Persian and Arabic digits.

This response is returned with caching disabled.
`,

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    query: ClientPhoneQuerySchema,
  },

  responses: {
    200: {
      description:
        "Lookup completed successfully. Data is either the matching client or null.",

      headers: {
        "Cache-Control": {
          description: "Caching is disabled for client data.",

          schema: {
            type: "string",

            example: "no-store",
          },
        },
      },

      content: {
        "application/json": {
          schema: ClientLookupSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// GET /clients/{clientId}
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/clients/{clientId}",

  operationId: "getClientById",

  tags: ["Clients"],

  summary: "Get client by ID",

  description: `
Returns a single client belonging to the authenticated lawyer.

A client owned by another lawyer is treated as not found.

This response is returned with caching disabled.
`,

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: ParamClientIdSchema,
  },

  responses: {
    200: {
      description: "Client returned successfully.",

      headers: {
        "Cache-Control": {
          description: "Caching is disabled for client data.",

          schema: {
            type: "string",

            example: "no-store",
          },
        },
      },

      content: {
        "application/json": {
          schema: ClientSuccessSchema,
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
// PATCH /clients/{clientId}
// ========================================================

openApiRegistry.registerPath({
  method: "patch",

  path: "/clients/{clientId}",

  operationId: "updateClient",

  tags: ["Clients"],

  summary: "Update a client",

  description: `
Partially updates a client belonging to the authenticated lawyer.

At least one field must be submitted.

### Identity changes

If \`phone\` or \`nationalId\` is changed, the backend verifies that the new value is not already used by another client belonging to the same lawyer.

### Optional values

Optional string fields can be cleared by submitting an empty value where supported. The backend normalizes these values and removes the persisted field.

The client's lawyer ownership cannot be changed.
`,

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: ParamClientIdSchema,

    body: {
      required: true,

      content: {
        "application/json": {
          schema: UpdateClientSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Client updated successfully.",

      content: {
        "application/json": {
          schema: ClientSuccessSchema,
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
