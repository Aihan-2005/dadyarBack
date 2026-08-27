import { openApiRegistry } from "../openapi.registry";

import {
  ApiErrorSchema,
  CreateTicketMessageMultipartSchema,
  CreateTicketMultipartSchema,
  TicketAttachmentUrlSuccessSchema,
  TicketListSuccessSchema,
  TicketMessageListSuccessSchema,
  TicketMessageSuccessSchema,
  TicketSuccessSchema,
} from "../schemas/ticket.openapi.schemas";

import { ParamTicketIdSchema } from "../../validators/ticket.validator";

import { ParamTicketMessageIdSchema } from "../../validators/ticketMessage.validator";

// ========================================================
// Shared Responses
// ========================================================

const badRequestResponse = {
  description: "The request is invalid or the attachment type is not allowed.",

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
  description: "The ticket, message, or attachment was not found.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const conflictResponse = {
  description:
    "The operation cannot be performed because the ticket is closed.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const attachmentTooLargeResponse = {
  description: "The attachment exceeds the 2 MB limit.",

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
// POST /tickets
// ========================================================

openApiRegistry.registerPath({
  method: "post",

  path: "/tickets",

  operationId: "createTicket",

  tags: ["Tickets"],

  summary: "Create a support ticket",

  description: `
Creates a support ticket for the authenticated lawyer.

The request uses \`multipart/form-data\`.

The submitted \`description\` is stored as the **first TicketMessage**, not directly on the Ticket document.

If an attachment is provided, it belongs to that first message.

### Attachment rules

- Maximum one attachment
- Maximum size: 2 MB
- Allowed extensions:
  - jpg
  - png
  - pdf
  - doc
  - docx
  - xls
  - xlsx
  - zip
  - rar

The ticket itself stores metadata such as title, type, status, and lawyer ownership.
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
        "multipart/form-data": {
          schema: CreateTicketMultipartSchema,
        },
      },
    },
  },

  responses: {
    201: {
      description: "Ticket created successfully.",

      content: {
        "application/json": {
          schema: TicketSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    413: attachmentTooLargeResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// GET /tickets
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/tickets",

  operationId: "listTickets",

  tags: ["Tickets"],

  summary: "List the authenticated lawyer's tickets",

  description:
    "Returns only tickets belonging to the authenticated lawyer, ordered newest first.",

  security: [
    {
      bearerAuth: [],
    },
  ],

  responses: {
    200: {
      description: "Tickets returned successfully.",

      content: {
        "application/json": {
          schema: TicketListSuccessSchema,
        },
      },
    },

    401: unauthorizedResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// GET /tickets/{id}
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/tickets/{id}",

  operationId: "getTicket",

  tags: ["Tickets"],

  summary: "Get one ticket",

  description:
    "Returns the ticket only if it belongs to the authenticated lawyer.",

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: ParamTicketIdSchema,
  },

  responses: {
    200: {
      description: "Ticket returned successfully.",

      content: {
        "application/json": {
          schema: TicketSuccessSchema,
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
// GET /tickets/{id}/messages
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/tickets/{id}/messages",

  operationId: "listTicketMessages",

  tags: ["Tickets"],

  summary: "List ticket messages",

  description: `
Returns the conversation for a ticket belonging to the authenticated lawyer.

Messages are returned in chronological order, oldest first.

The initial ticket description appears as the first lawyer message.
`,

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: ParamTicketIdSchema,
  },

  responses: {
    200: {
      description: "Ticket messages returned successfully.",

      content: {
        "application/json": {
          schema: TicketMessageListSuccessSchema,
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
// POST /tickets/{id}/messages
// ========================================================

openApiRegistry.registerPath({
  method: "post",

  path: "/tickets/{id}/messages",

  operationId: "createTicketMessage",

  tags: ["Tickets"],

  summary: "Send a ticket message",

  description: `
Adds a new lawyer message to an existing ticket.

The request uses \`multipart/form-data\`.

An optional attachment can be included and will belong specifically to this message.

Messages cannot be added after the ticket reaches \`CLOSED\`.
`,

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: ParamTicketIdSchema,

    body: {
      required: true,

      content: {
        "multipart/form-data": {
          schema: CreateTicketMessageMultipartSchema,
        },
      },
    },
  },

  responses: {
    201: {
      description: "Ticket message created successfully.",

      content: {
        "application/json": {
          schema: TicketMessageSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    404: notFoundResponse,

    409: conflictResponse,

    413: attachmentTooLargeResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// GET /tickets/{id}/messages/{messageId}/attachment
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/tickets/{id}/messages/{messageId}/attachment",

  operationId: "getTicketMessageAttachment",

  tags: ["Tickets"],

  summary: "Get a message attachment download URL",

  description: `
Returns a temporary presigned URL for the attachment belonging to a specific ticket message.

The backend first verifies:

1. the ticket belongs to the authenticated lawyer
2. the message belongs to that ticket
3. the message has an attachment

The returned S3 URL currently expires after 600 seconds.
`,

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: ParamTicketMessageIdSchema,
  },

  responses: {
    200: {
      description: "Temporary attachment download URL returned successfully.",

      content: {
        "application/json": {
          schema: TicketAttachmentUrlSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    404: notFoundResponse,

    500: serverErrorResponse,
  },
});
