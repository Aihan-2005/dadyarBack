import { openApiRegistry } from "../openapi.registry";

import {
  AdminClientListSuccessSchema,
  AdminClientSuccessSchema,
  AdminDashboardSuccessSchema,
  AdminLawyerListSuccessSchema,
  AdminLawyerSuccessSchema,
  AdminManagedUserAccountSuccessSchema,
  AdminPasswordResetSuccessSchema,
  ApiErrorSchema,
} from "../schemas/admin.openapi.schemas";

import {
  CreateTicketMessageMultipartSchema,
  TicketAttachmentUrlSuccessSchema,
  AdminTicketListSuccessSchema,
  TicketMessageListSuccessSchema,
  TicketMessageSuccessSchema,
  TicketSuccessSchema,
} from "../schemas/ticket.openapi.schemas";

import {
  AdminClientListQuerySchema,
  AdminLawyerListQuerySchema,
  AdminResetUserPasswordSchema,
  AdminUpdateLawyerStatusSchema,
  AdminUpdateUserStatusSchema,
  AdminUserIdParamSchema,
} from "../../validators/admin.validator";

import {
  ParamTicketIdSchema,
  UpdateTicketStatusSchema,
} from "../../validators/ticket.validator";

import { ParamTicketMessageIdSchema } from "../../validators/ticketMessage.validator";

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
    "The submitted request, query parameters, route parameters, or body are invalid.",

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
    "The authenticated account is not permitted to access admin resources. This includes non-ADMIN accounts and suspended accounts.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const notFoundResponse = {
  description:
    "The requested admin-managed resource was not found, or the supplied ID does not belong to the role required by this endpoint.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const ticketNotFoundResponse = {
  description:
    "The requested ticket, ticket message, or ticket attachment was not found.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const ticketClosedResponse = {
  description:
    "The operation cannot be performed because the ticket is CLOSED.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const attachmentTooLargeResponse = {
  description:
    "The uploaded attachment exceeds the configured 2 MB attachment limit.",

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
// GET /admin/dashboard
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/admin/dashboard",

  operationId: "getAdminDashboard",

  tags: ["Admin"],

  summary: "Get admin dashboard statistics",

  description: `
Returns the summary statistics used by the administration dashboard.

This endpoint requires:

\`Authorization: Bearer <accessToken>\`

and the authenticated User must have role:

\`ADMIN\`

### Account statistics

\`accounts.clients\` describes CLIENT User accounts.

\`accounts.lawyers\` describes LAWYER User accounts.

For both groups:

- \`total\` is the total number of User accounts for that role
- \`active\` counts User accounts whose account status is \`ACTIVE\`
- \`suspended\` counts User accounts whose account status is \`SUSPENDED\`

These values describe **User account access**, not lawyer professional verification.

### Lawyer profile statistics

\`lawyerProfiles\` describes the separate professional Lawyer records.

Possible professional statuses are:

- \`PENDING_VERIFICATION\`
- \`ACTIVE\`
- \`SUSPENDED\`
- \`REJECTED\`

The response converts those statuses into dashboard fields:

- \`pendingVerification\`
- \`active\`
- \`suspended\`
- \`rejected\`

### Ticket statistics

The ticket counters represent:

- \`OPEN\` → \`open\`
- \`IN_PROGRESS\` → \`inProgress\`
- \`WAITING_FOR_LAWYER\` → \`waitingForLawyer\`
- \`RESOLVED\` → \`resolved\`
- \`CLOSED\` → \`closed\`

An empty database still returns all counters with value \`0\`.
`,

  security: adminSecurity,

  responses: {
    200: {
      description: "Admin dashboard statistics returned successfully.",

      content: {
        "application/json": {
          schema: AdminDashboardSuccessSchema,
        },
      },
    },

    401: unauthorizedResponse,

    403: forbiddenResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// GET /admin/lawyers
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/admin/lawyers",

  operationId: "listAdminLawyers",

  tags: ["Admin"],

  summary: "List and search lawyers",

  description: `
Returns a paginated administration view of LAWYER accounts.

Unlike the generic User representation, each result combines data from both:

- the shared \`User\` account
- the professional \`Lawyer\` profile

Results are ordered by lawyer creation time, newest first.

### Search

The optional \`search\` parameter is case-insensitive and searches:

- first name
- last name
- full name
- license number
- specialization
- User email
- User phone number

User-supplied search text is escaped before being used as a regular expression.

For example, a search value such as:

\`.*\`

is treated as literal text rather than an unrestricted regular-expression wildcard.

### Lawyer professional status filter

\`lawyerStatus\` filters the professional Lawyer record.

Allowed values:

- \`PENDING_VERIFICATION\`
- \`ACTIVE\`
- \`SUSPENDED\`
- \`REJECTED\`

This is independent of User account status.

### Account status filter

\`accountStatus\` filters the shared User account.

Allowed values:

- \`ACTIVE\`
- \`SUSPENDED\`

### Pagination

Defaults:

- \`page=1\`
- \`limit=20\`

Maximum limit:

- \`100\`

The pagination total represents the number of records matching all active search and filter conditions.
`,

  security: adminSecurity,

  request: {
    query: AdminLawyerListQuerySchema,
  },

  responses: {
    200: {
      description: "Lawyers returned successfully.",

      content: {
        "application/json": {
          schema: AdminLawyerListSuccessSchema,
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
// GET /admin/lawyers/{id}
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/admin/lawyers/{id}",

  operationId: "getAdminLawyer",

  tags: ["Admin"],

  summary: "Get lawyer administration details",

  description: `
Returns the complete administration representation of a LAWYER.

The supplied ID must identify a User whose role is \`LAWYER\` and an associated Lawyer professional profile must exist.

A CLIENT ID supplied to this endpoint is treated as not found.

### Status distinction

The response intentionally exposes two status fields:

\`accountStatus\`

Represents the shared User account status:

- \`ACTIVE\`
- \`SUSPENDED\`

\`lawyerStatus\`

Represents professional lawyer verification/status:

- \`PENDING_VERIFICATION\`
- \`ACTIVE\`
- \`SUSPENDED\`
- \`REJECTED\`

These statuses are independent.

For example, a lawyer can theoretically have:

\`\`\`json
{
  "accountStatus": "SUSPENDED",
  "lawyerStatus": "ACTIVE"
}
\`\`\`

meaning the professional verification remains valid while access to the User account has been suspended.
`,

  security: adminSecurity,

  request: {
    params: AdminUserIdParamSchema,
  },

  responses: {
    200: {
      description: "Lawyer returned successfully.",

      content: {
        "application/json": {
          schema: AdminLawyerSuccessSchema,
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
// PATCH /admin/lawyers/{id}/status
// ========================================================

openApiRegistry.registerPath({
  method: "patch",

  path: "/admin/lawyers/{id}/status",

  operationId: "updateAdminLawyerStatus",

  tags: ["Admin"],

  summary: "Change lawyer professional status",

  description: `
Changes the professional status stored on the Lawyer profile.

This endpoint does **not** change the User account status.

Allowed values:

- \`PENDING_VERIFICATION\`
- \`ACTIVE\`
- \`SUSPENDED\`
- \`REJECTED\`

### License verification behavior

The status transition also controls \`licenseVerifiedAt\`.

#### ACTIVE

When setting the professional status to \`ACTIVE\`:

- an existing \`licenseVerifiedAt\` value is preserved
- if no previous verification timestamp exists, the current time becomes the verification timestamp

This means repeated activation does not continuously replace the original verification time.

#### PENDING_VERIFICATION

Setting status to \`PENDING_VERIFICATION\` clears:

\`licenseVerifiedAt\`

The license is therefore represented as not verified.

#### REJECTED

Setting status to \`REJECTED\` also clears:

\`licenseVerifiedAt\`

#### SUSPENDED

Setting status to \`SUSPENDED\` preserves an existing license-verification timestamp.

Suspension therefore does not erase the historical fact that the lawyer's license had previously been verified.

### Account access

Professional lawyer status and User account status are separate concerns.

Use:

\`PATCH /admin/lawyers/{id}/account-status\`

to suspend or reactivate the User account itself.
`,

  security: adminSecurity,

  request: {
    params: AdminUserIdParamSchema,

    body: {
      required: true,

      content: {
        "application/json": {
          schema: AdminUpdateLawyerStatusSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Lawyer professional status updated successfully.",

      content: {
        "application/json": {
          schema: AdminLawyerSuccessSchema,
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
// PATCH /admin/lawyers/{id}/account-status
// ========================================================

openApiRegistry.registerPath({
  method: "patch",

  path: "/admin/lawyers/{id}/account-status",

  operationId: "updateAdminLawyerAccountStatus",

  tags: ["Admin"],

  summary: "Suspend or reactivate a lawyer account",

  description: `
Changes the shared User account status for a LAWYER account.

Allowed values:

- \`ACTIVE\`
- \`SUSPENDED\`

The database mutation is role-scoped.

The query requires both:

- the requested User ID
- User role \`LAWYER\`

Therefore a CLIENT ID passed to this route is treated as not found and cannot be modified accidentally.

### Independence from professional status

Changing account status does **not** change:

\`Lawyer.status\`

For example:

\`\`\`text
User.status   = SUSPENDED
Lawyer.status = ACTIVE
\`\`\`

is a valid state.

It means the lawyer remains professionally verified but the account cannot currently use authenticated application functionality.

### Authentication effect

The authentication middleware reloads account access context from the database.

A User whose account status becomes \`SUSPENDED\` is denied on subsequent authenticated requests, even if an otherwise valid access token exists.

### Response naming

This mutation currently returns the shared User representation.

Therefore the returned account field is named:

\`status\`

rather than:

\`accountStatus\`

The admin lawyer detail endpoint uses \`accountStatus\` because it must expose both User and Lawyer statuses simultaneously.
`,

  security: adminSecurity,

  request: {
    params: AdminUserIdParamSchema,

    body: {
      required: true,

      content: {
        "application/json": {
          schema: AdminUpdateUserStatusSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Lawyer User account status updated successfully.",

      content: {
        "application/json": {
          schema: AdminManagedUserAccountSuccessSchema,
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
// PATCH /admin/lawyers/{id}/password
// ========================================================

openApiRegistry.registerPath({
  method: "patch",

  path: "/admin/lawyers/{id}/password",

  operationId: "resetAdminLawyerPassword",

  tags: ["Admin"],

  summary: "Reset a lawyer account password",

  description: `
Allows an ADMIN to assign a new password to a LAWYER account.

This is an administrative password **reset**, not the normal authenticated password-change flow.

The admin does not submit:

- the user's current password
- an OTP
- the user's email
- the user's phone number

The target account is selected exclusively through the route ID and the route's LAWYER role scope.

### Password rules

The new password must:

- contain at least 8 characters
- remain within bcrypt's 72-byte UTF-8 input limit

The password is hashed with bcrypt before persistence.

### Role scope

The underlying update requires:

- matching User ID
- role \`LAWYER\`

A CLIENT ID therefore returns not found and is not modified.

### Transaction

The password update and refresh-session revocation are performed in one MongoDB transaction.

The operation commits only if both operations succeed.

### Session security

After a successful reset:

- all stored refresh-token sessions belonging to the target user are revoked
- previously issued refresh tokens can no longer create new access tokens

Previously issued stateless access tokens may remain usable until their normal short expiration time.

The endpoint does not issue a replacement authentication session to the affected user.
`,

  security: adminSecurity,

  request: {
    params: AdminUserIdParamSchema,

    body: {
      required: true,

      content: {
        "application/json": {
          schema: AdminResetUserPasswordSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description:
        "Lawyer password reset successfully and refresh sessions revoked.",

      content: {
        "application/json": {
          schema: AdminPasswordResetSuccessSchema,
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
// GET /admin/clients
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/admin/clients",

  operationId: "listAdminClients",

  tags: ["Admin"],

  summary: "List and search client accounts",

  description: `
Returns a paginated administration list of registered CLIENT User accounts.

These are application User accounts whose role is:

\`CLIENT\`

They are not LawyerClient relationship records.

### Search

The optional \`search\` parameter performs a case-insensitive search over:

- email
- phone

Search text is escaped before being converted to a regular expression.

### Account status filter

The optional \`accountStatus\` filter accepts:

- \`ACTIVE\`
- \`SUSPENDED\`

### Pagination

Defaults:

- \`page=1\`
- \`limit=20\`

Maximum limit:

- \`100\`

The reported pagination total uses the same filters as the returned result list.

Results are ordered newest first.
`,

  security: adminSecurity,

  request: {
    query: AdminClientListQuerySchema,
  },

  responses: {
    200: {
      description: "Client accounts returned successfully.",

      content: {
        "application/json": {
          schema: AdminClientListSuccessSchema,
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
// GET /admin/clients/{id}
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/admin/clients/{id}",

  operationId: "getAdminClient",

  tags: ["Admin"],

  summary: "Get one client account",

  description: `
Returns the administration representation of a CLIENT User account.

The database lookup is role-scoped to:

\`CLIENT\`

A LAWYER ID supplied to this endpoint is therefore treated as not found.

The response exposes:

- email
- phone
- role
- account status
- email verification information
- phone verification information
- last login
- account creation time

Password hashes and other persistence-only fields are never returned.
`,

  security: adminSecurity,

  request: {
    params: AdminUserIdParamSchema,
  },

  responses: {
    200: {
      description: "Client account returned successfully.",

      content: {
        "application/json": {
          schema: AdminClientSuccessSchema,
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
// PATCH /admin/clients/{id}/account-status
// ========================================================

openApiRegistry.registerPath({
  method: "patch",

  path: "/admin/clients/{id}/account-status",

  operationId: "updateAdminClientAccountStatus",

  tags: ["Admin"],

  summary: "Suspend or reactivate a client account",

  description: `
Changes the User account status for a CLIENT account.

Allowed statuses:

- \`ACTIVE\`
- \`SUSPENDED\`

The mutation is role-scoped to \`CLIENT\`.

A LAWYER ID passed to this endpoint is treated as not found.

### Authentication effect

A suspended account is denied by the authentication middleware on subsequent authenticated requests.

### Response

The mutation returns the shared public User representation.

The account-status field is therefore named:

\`status\`

rather than the \`accountStatus\` name used by the admin client list/detail DTO.
`,

  security: adminSecurity,

  request: {
    params: AdminUserIdParamSchema,

    body: {
      required: true,

      content: {
        "application/json": {
          schema: AdminUpdateUserStatusSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Client account status updated successfully.",

      content: {
        "application/json": {
          schema: AdminManagedUserAccountSuccessSchema,
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
// PATCH /admin/clients/{id}/password
// ========================================================

openApiRegistry.registerPath({
  method: "patch",

  path: "/admin/clients/{id}/password",

  operationId: "resetAdminClientPassword",

  tags: ["Admin"],

  summary: "Reset a client account password",

  description: `
Allows an ADMIN to assign a new password to a CLIENT account.

This is an administrative password reset.

No current password or OTP is required.

### Password rules

The password must:

- contain at least 8 characters
- remain within bcrypt's 72-byte UTF-8 input limit

### Role scope

The target database update requires:

- matching User ID
- role \`CLIENT\`

A LAWYER ID supplied to this endpoint is treated as not found.

### Security behavior

The new password is bcrypt-hashed before persistence.

The password update and refresh-session revocation execute in the same MongoDB transaction.

After success:

- all refresh-token sessions belonging to the target user are revoked
- old refresh tokens cannot be used to obtain new access tokens
- previously issued access JWTs may remain usable until normal expiration

The endpoint does not create a new session for the affected client.
`,

  security: adminSecurity,

  request: {
    params: AdminUserIdParamSchema,

    body: {
      required: true,

      content: {
        "application/json": {
          schema: AdminResetUserPasswordSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description:
        "Client password reset successfully and refresh sessions revoked.",

      content: {
        "application/json": {
          schema: AdminPasswordResetSuccessSchema,
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
// GET /admin/tickets
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/admin/tickets",

  operationId: "listAdminTickets",

  tags: ["Admin"],

  summary: "List all support tickets",

  description: `
Returns all support tickets across all lawyers.

Each ticket additionally includes:

- \`messageCount\` — total number of messages currently associated with the ticket.

The ticket's original description is persisted as the first LAWYER message and is therefore included in this count.

Unlike the lawyer-facing:

\`GET /tickets\`

this endpoint is not scoped to the authenticated lawyer.

The administration endpoint can see tickets belonging to every lawyer.

Results are ordered newest first.

The current admin ticket list is not paginated.
`,

  security: adminSecurity,

  responses: {
    200: {
      description: "Tickets returned successfully.",

      content: {
        "application/json": {
          schema: AdminTicketListSuccessSchema,
        },
      },
    },

    401: unauthorizedResponse,

    403: forbiddenResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// GET /admin/tickets/{id}
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/admin/tickets/{id}",

  operationId: "getAdminTicket",

  tags: ["Admin"],

  summary: "Get any support ticket",

  description: `
Returns one support ticket by ID.

This admin endpoint is not restricted to ticket ownership.

Any ticket can be retrieved by an authenticated ADMIN.
`,

  security: adminSecurity,

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

    403: forbiddenResponse,

    404: ticketNotFoundResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// PATCH /admin/tickets/{id}/status
// ========================================================

openApiRegistry.registerPath({
  method: "patch",

  path: "/admin/tickets/{id}/status",

  operationId: "updateAdminTicketStatus",

  tags: ["Admin"],

  summary: "Change support ticket status",

  description: `
Changes the status of any support ticket.

Allowed values are:

- \`OPEN\`
- \`IN_PROGRESS\`
- \`WAITING_FOR_LAWYER\`
- \`RESOLVED\`
- \`CLOSED\`

The ticket must exist before the status update is applied.

A ticket whose status becomes \`CLOSED\` can no longer receive new lawyer or admin messages through the existing ticket-message services.
`,

  security: adminSecurity,

  request: {
    params: ParamTicketIdSchema,

    body: {
      required: true,

      content: {
        "application/json": {
          schema: UpdateTicketStatusSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Ticket status updated successfully.",

      content: {
        "application/json": {
          schema: TicketSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    403: forbiddenResponse,

    404: ticketNotFoundResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// GET /admin/tickets/{id}/messages
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/admin/tickets/{id}/messages",

  operationId: "listAdminTicketMessages",

  tags: ["Admin"],

  summary: "List all messages for a ticket",

  description: `
Returns the full conversation for any support ticket.

The ticket must exist.

Unlike the lawyer-facing message endpoint, no lawyer ownership check is applied.

Messages are returned in chronological order, oldest first.

Possible sender types include:

- \`LAWYER\`
- \`ADMIN\`

The original description supplied when a ticket was created is represented as the first LAWYER message.
`,

  security: adminSecurity,

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

    403: forbiddenResponse,

    404: ticketNotFoundResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// POST /admin/tickets/{id}/messages
// ========================================================

openApiRegistry.registerPath({
  method: "post",

  path: "/admin/tickets/{id}/messages",

  operationId: "createAdminTicketMessage",

  tags: ["Admin"],

  summary: "Reply to a support ticket as admin",

  description: `
Adds an ADMIN message to an existing support ticket.

The authenticated admin's User ID becomes:

\`senderId\`

and the message is persisted with:

\`senderType = ADMIN\`

### Ticket state

Messages cannot be added when the ticket status is:

\`CLOSED\`

Attempting to reply to a closed ticket returns a conflict response.

### Request format

The endpoint uses:

\`multipart/form-data\`

Required field:

- \`message\`

Optional field:

- \`attachment\`

### Attachment rules

At most one attachment may be uploaded.

Maximum size:

- 2 MB

Supported extensions follow the existing ticket upload policy:

- jpg
- png
- pdf
- doc
- docx
- xls
- xlsx
- zip
- rar

If an attachment is uploaded, the file is stored and its database attachment record is associated specifically with the newly created TicketMessage.

The message/attachment creation path uses transactional persistence for attachment metadata where required.
`,

  security: adminSecurity,

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
      description: "Admin ticket message created successfully.",

      content: {
        "application/json": {
          schema: TicketMessageSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    403: forbiddenResponse,

    404: ticketNotFoundResponse,

    409: ticketClosedResponse,

    413: attachmentTooLargeResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// GET /admin/tickets/{id}/messages/{messageId}/attachment
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/admin/tickets/{id}/messages/{messageId}/attachment",

  operationId: "getAdminTicketMessageAttachment",

  tags: ["Admin"],

  summary: "Get ticket message attachment download URL",

  description: `
Returns a temporary presigned download URL for an attachment associated with a ticket message.

The backend verifies:

1. the ticket exists
2. the message belongs to that ticket
3. the message has an attachment

Admin access is not restricted by lawyer ownership.

If the ticket exists but the message belongs to a different ticket, the message is treated as not found.

If the message exists but has no attachment, the attachment is treated as not found.

The returned URL follows the same attachment download behavior as the lawyer-facing ticket endpoint.
`,

  security: adminSecurity,

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

    403: forbiddenResponse,

    404: ticketNotFoundResponse,

    500: serverErrorResponse,
  },
});
