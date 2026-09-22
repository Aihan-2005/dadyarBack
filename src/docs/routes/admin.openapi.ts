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
import {
  CreateSubscriptionPlanSchema,
  SubscriptionPlanIdParamSchema,
  UpdateSubscriptionPlanSchema,
} from "../../validators/subscriptionPlan.validator";
import {
  SubscriptionPlanListSuccessSchema,
  SubscriptionPlanOptionsSuccessSchema,
  SubscriptionPlanSuccessSchema,
} from "../schemas/subscriptionPlan.openapi.schemas";

import {
  LawyerSubscriptionLawyerIdParamSchema,
  LawyerSubscriptionHistoryQuerySchema,
  CreateLawyerSubscriptionSchema,
} from "../../validators/lawyerSubscription.validator";

import {
  LawyerSubscriptionHistorySuccessSchema,
  LawyerSubscriptionSuccessSchema,
} from "../schemas/lawyerSubscription.openapi.schemas";

import {
  AdminPaymentListQuerySchema,
  PaymentIdParamSchema,
} from "../../validators/payment.validator";

import {
  AdminPaymentListSuccessSchema,
  AdminPaymentSuccessSchema,
  PaymentReconciliationSuccessSchema,
} from "../schemas/payment.openapi.schemas";

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

const paymentConflictResponse = {
  description:
    "The payment state does not allow the requested administrative operation.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const paymentProviderErrorResponse = {
  description:
    "The payment provider could not complete the reconciliation or verification request.",

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

// ========================================================
// GET /admin/subscription-plans
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/admin/subscription-plans",

  operationId: "listAdminSubscriptionPlans",

  tags: ["Admin"],

  summary: "List all subscription plans for administration",

  description: `
Returns the complete subscription-plan catalog for the administration panel.

This endpoint requires:

\`Authorization: Bearer <accessToken>\`

and the authenticated User must have role:

\`ADMIN\`

Unlike the public subscription-plan endpoint, this endpoint returns **both active and inactive plans**.

This allows administrators to:

- inspect currently available plans
- inspect archived or disabled plans
- reactivate an existing plan
- edit pricing, duration, presentation, tier, and enabled features

### Archiving

Subscription plans are not currently deleted through an administration endpoint.

Instead, an administrator can update:

\`\`\`json
{
  "isActive": false
}
\`\`\`

Inactive plans remain stored so future LawyerSubscription and Payment records can safely continue referencing historical plans.

### Ordering

Results are ordered by:

1. \`sortOrder ASC\`
2. \`createdAt DESC\`
`,

  security: adminSecurity,

  responses: {
    200: {
      description: "All subscription plans returned successfully.",

      content: {
        "application/json": {
          schema: SubscriptionPlanListSuccessSchema,
        },
      },
    },

    401: unauthorizedResponse,

    403: forbiddenResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// GET /admin/subscription-plans/options
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/admin/subscription-plans/options",

  operationId: "getAdminSubscriptionPlanOptions",

  tags: ["Admin"],

  summary: "Get available plan tiers and features",

  description: `
Returns the backend-defined options required by the administration interface when creating or editing a subscription plan.

This endpoint requires an authenticated:

\`ADMIN\`

account.

The response contains:

- supported subscription tiers
- supported subscription features

The administration frontend should use this endpoint rather than maintaining its own hard-coded list of subscription capabilities.

This keeps the backend as the source of truth.

### Tiers

Current tier values are:

- \`BASIC\`
- \`STANDARD\`
- \`PREMIUM\`

### Features

Each feature contains:

- \`code\`
- \`title\`
- \`description\`

The \`code\` is the machine-readable value stored in a SubscriptionPlan.

The \`title\` and \`description\` are presentation metadata that can be used by the administration UI to render checkboxes, toggles, or other controls.

For example:

\`\`\`json
{
  "code": "ONLINE_MEETINGS",
  "title": "Online meetings",
  "description": "Ability to create and manage online meetings."
}
\`\`\`

The admin frontend can display a switch for this option and submit:

\`\`\`json
{
  "features": [
    "ONLINE_MEETINGS"
  ]
}
\`\`\`

when creating or updating a plan.

Feature definitions are application capabilities defined by backend code.

Administrators can choose which supported capabilities belong to a plan, but they cannot dynamically create arbitrary new feature codes through the API.
`,

  security: adminSecurity,

  responses: {
    200: {
      description: "Subscription plan options returned successfully.",

      content: {
        "application/json": {
          schema: SubscriptionPlanOptionsSuccessSchema,
        },
      },
    },

    401: unauthorizedResponse,

    403: forbiddenResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// POST /admin/subscription-plans
// ========================================================

openApiRegistry.registerPath({
  method: "post",

  path: "/admin/subscription-plans",

  operationId: "createAdminSubscriptionPlan",

  tags: ["Admin"],

  summary: "Create a subscription plan",

  description: `
Creates a new subscription plan.

This endpoint requires:

\`Authorization: Bearer <accessToken>\`

and the authenticated User must have role:

\`ADMIN\`.

### Required values

A plan requires:

- \`title\`
- \`description\`
- \`tier\`
- \`durationMonths\`
- \`price\`
- at least one supported \`feature\`

### Optional/defaulted values

The following fields have defaults when omitted:

- \`tags = []\`
- \`discountPercent = 0\`
- \`isActive = true\`
- \`sortOrder = 0\`

### Tier

The submitted tier must be one of:

- \`BASIC\`
- \`STANDARD\`
- \`PREMIUM\`

### Features

Every feature must be one of the backend-defined subscription feature codes.

Duplicate feature values are rejected.

At least one feature is required.

Available values can be retrieved from:

\`GET /admin/subscription-plans/options\`

### Tags

Tags are presentation/marketing metadata.

A plan may contain at most 10 tags.

Each tag:

- must not be empty
- may contain at most 50 characters

Tag uniqueness is checked case-insensitively.

Therefore:

\`\`\`json
[
  "Popular",
  "popular"
]
\`\`\`

is rejected.

### Duration

\`durationMonths\` must be an integer between:

\`1\` and \`120\`

### Price

\`price\` must be a non-negative integer.

The API currently does not expose a separate currency field, so callers must use the monetary unit defined by the application's commercial/payment configuration consistently.

### Discount

\`discountPercent\` must be an integer between:

\`0\` and \`100\`

### Example

\`\`\`json
{
  "title": "Professional Monthly",
  "description": "Tools for lawyers managing an active legal practice.",
  "tier": "STANDARD",
  "tags": [
    "Popular"
  ],
  "durationMonths": 1,
  "price": 900000,
  "discountPercent": 10,
  "features": [
    "CASE_MANAGEMENT",
    "FINANCIAL_REPORTS",
    "SCHEDULING",
    "ONLINE_MEETINGS"
  ],
  "isActive": true,
  "sortOrder": 2
}
\`\`\`
`,

  security: adminSecurity,

  request: {
    body: {
      required: true,

      content: {
        "application/json": {
          schema: CreateSubscriptionPlanSchema,
        },
      },
    },
  },

  responses: {
    201: {
      description: "Subscription plan created successfully.",

      content: {
        "application/json": {
          schema: SubscriptionPlanSuccessSchema,
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
// PATCH /admin/subscription-plans/{id}
// ========================================================

openApiRegistry.registerPath({
  method: "patch",

  path: "/admin/subscription-plans/{id}",

  operationId: "updateAdminSubscriptionPlan",

  tags: ["Admin"],

  summary: "Update a subscription plan",

  description: `
Updates one existing subscription plan.

This endpoint requires:

\`Authorization: Bearer <accessToken>\`

and the authenticated User must have role:

\`ADMIN\`.

The request is a partial update.

Any supported plan field may be changed independently, including:

- title
- description
- tier
- tags
- duration
- price
- discount
- features
- active status
- sort order

An empty request body is rejected.

### Disabling a plan

To stop offering a plan publicly without deleting its historical record:

\`\`\`json
{
  "isActive": false
}
\`\`\`

After this change:

\`GET /subscription-plans\`

will no longer return the plan.

However:

\`GET /admin/subscription-plans\`

will continue returning it.

The plan can later be reactivated with:

\`\`\`json
{
  "isActive": true
}
\`\`\`

### Updating features

The complete feature array supplied in this request becomes the plan's current feature set.

For example:

\`\`\`json
{
  "features": [
    "CASE_MANAGEMENT",
    "FINANCIAL_REPORTS",
    "SCHEDULING",
    "ONLINE_MEETINGS",
    "CLIENT_DIRECTORY_VISIBILITY"
  ]
}
\`\`\`

Available feature codes should be obtained from:

\`GET /admin/subscription-plans/options\`

### Historical subscriptions

This endpoint changes the SubscriptionPlan document itself.

Existing LawyerSubscription records preserve their purchase-time plan information in \`planSnapshot\`, so later edits to the SubscriptionPlan do not rewrite historical subscription data.

Future Payment records should follow the same principle for payment-time information that must remain historically accurate.
`,

  security: adminSecurity,

  request: {
    params: SubscriptionPlanIdParamSchema,

    body: {
      required: true,

      content: {
        "application/json": {
          schema: UpdateSubscriptionPlanSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Subscription plan updated successfully.",

      content: {
        "application/json": {
          schema: SubscriptionPlanSuccessSchema,
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
// GET /admin/lawyers/{id}/subscriptions
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/admin/lawyers/{id}/subscriptions",

  operationId: "listAdminLawyerSubscriptionHistory",

  tags: ["Admin"],

  summary: "List a lawyer's subscription history",

  description: `
Returns the subscription history belonging to one lawyer.

The supplied ID must identify an existing Lawyer.

Results are ordered by subscription creation time, newest first.

### Pagination

Defaults:

- \`page=1\`
- \`limit=20\`

Maximum limit:

- \`100\`

The response contains:

- \`data\` — subscription records for the requested page
- \`pagination.page\`
- \`pagination.limit\`
- \`pagination.total\`
- \`pagination.totalPages\`

### Historical plan information

Each subscription contains a \`planSnapshot\`.

The snapshot preserves the relevant SubscriptionPlan values that existed when the subscription was activated.

Therefore changing or disabling the associated SubscriptionPlan later does not rewrite historical subscription information.

### Status

Subscription status is calculated from:

- \`cancelledAt\`
- \`endsAt\`

and is not persisted as an independent status field.
`,

  security: adminSecurity,

  request: {
    params: LawyerSubscriptionLawyerIdParamSchema,

    query: LawyerSubscriptionHistoryQuerySchema,
  },

  responses: {
    200: {
      description: "Lawyer subscription history returned successfully.",

      content: {
        "application/json": {
          schema: LawyerSubscriptionHistorySuccessSchema,
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
// POST /admin/lawyers/{id}/subscriptions
// ========================================================

openApiRegistry.registerPath({
  method: "post",

  path: "/admin/lawyers/{id}/subscriptions",

  operationId: "createAdminLawyerSubscription",

  tags: ["Admin"],

  summary: "Activate a subscription for a lawyer",

  description: `
Creates and immediately activates a subscription for one lawyer.

This endpoint is intended for administrator-driven subscription activation.

The request body contains the SubscriptionPlan ID:

\`\`\`json
{
  "planId": "507f1f77bcf86cd799439011"
}
\`\`\`

The selected plan must:

- exist
- currently have \`isActive = true\`

### Existing subscription

A lawyer cannot receive a second subscription while another current subscription is active.

If an active subscription already exists, the endpoint returns:

\`409 Conflict\`

### Activation source

Subscriptions created through this endpoint use:

\`activationSource = ADMIN\`

The authenticated admin User ID is stored as:

\`activatedByUserId\`

The \`PAYMENT\` activation source is reserved for payment-driven activation flows.

### Plan snapshot

The plan's commercial and feature information is copied into \`planSnapshot\` when the subscription is created.

This prevents later SubscriptionPlan edits from changing the meaning of an existing subscription.

### Duration

The current subscription implementation converts each \`durationMonths\` unit into a fixed 30-day duration.

For example:

- 1 month = 30 days
- 3 months = 90 days
- 12 months = 360 days

The subscription begins immediately.

\`startsAt\` is set to the activation time and \`endsAt\` is calculated from the configured duration.

### Concurrency

Subscription state mutations for the same lawyer are serialized transactionally.

This prevents concurrent activation requests from creating multiple simultaneously active subscriptions.
`,

  security: adminSecurity,

  request: {
    params: LawyerSubscriptionLawyerIdParamSchema,

    body: {
      required: true,

      content: {
        "application/json": {
          schema: CreateLawyerSubscriptionSchema,
        },
      },
    },
  },

  responses: {
    201: {
      description: "Lawyer subscription activated successfully.",

      content: {
        "application/json": {
          schema: LawyerSubscriptionSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    403: forbiddenResponse,

    404: notFoundResponse,

    409: {
      description: "The lawyer already has an active subscription.",

      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },

    500: serverErrorResponse,
  },
});

// ========================================================
// PATCH /admin/lawyers/{id}/subscriptions/current/cancel
// ========================================================

openApiRegistry.registerPath({
  method: "patch",

  path: "/admin/lawyers/{id}/subscriptions/current/cancel",

  operationId: "cancelAdminLawyerSubscription",

  tags: ["Admin"],

  summary: "Cancel a lawyer's current subscription",

  description: `
Cancels the currently active subscription belonging to one lawyer.

The lawyer must exist and must currently have an active subscription.

Cancellation sets:

\`cancelledAt\`

to the current time.

The subscription record is not deleted.

This preserves subscription history and the original plan snapshot.

After cancellation, the calculated subscription status becomes:

\`CANCELLED\`

and the subscription is no longer returned by:

\`GET /lawyer-subscriptions/current\`

### Concurrency

Cancellation uses the same transactional lawyer-level subscription guard as activation.

Therefore create and cancel operations affecting the same lawyer are serialized.
`,

  security: adminSecurity,

  request: {
    params: LawyerSubscriptionLawyerIdParamSchema,
  },

  responses: {
    200: {
      description: "Current lawyer subscription cancelled successfully.",

      content: {
        "application/json": {
          schema: LawyerSubscriptionSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    403: forbiddenResponse,

    404: {
      description:
        "The lawyer does not exist or does not currently have an active subscription.",

      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },

    500: serverErrorResponse,
  },
});

// ========================================================
// GET /admin/payments
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/admin/payments",

  operationId: "listAdminPayments",

  tags: ["Admin"],

  summary: "List payments for administration",

  description: `
Returns a paginated operational view of subscription payments.

Payments may be filtered by:

- lawyer
- financial status
- fulfillment status
- payment provider

Financial status represents what happened to the payment itself.

Fulfillment status separately represents whether the purchased subscription was delivered.

This distinction allows administrators to identify cases such as:

\`PAID + REQUIRES_ACTION\`

where money was successfully received but subscription activation still requires attention.
`,

  security: adminSecurity,

  request: {
    query: AdminPaymentListQuerySchema,
  },

  responses: {
    200: {
      description: "Payments returned successfully.",

      content: {
        "application/json": {
          schema: AdminPaymentListSuccessSchema,
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
// GET /admin/payments/{id}
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/admin/payments/{id}",

  operationId: "getAdminPayment",

  tags: ["Admin"],

  summary: "Get payment administration details",

  security: adminSecurity,

  request: {
    params: PaymentIdParamSchema,
  },

  responses: {
    200: {
      description: "Payment returned successfully.",

      content: {
        "application/json": {
          schema: AdminPaymentSuccessSchema,
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
// POST /admin/payments/{id}/retry-fulfillment
// ========================================================

openApiRegistry.registerPath({
  method: "post",

  path: "/admin/payments/{id}/retry-fulfillment",

  operationId: "retryAdminPaymentFulfillment",

  tags: ["Admin"],

  summary: "Retry subscription fulfillment for a paid payment",

  description: `
Retries only the application's subscription-delivery step.

This operation is intended for payments whose state is:

\`status = PAID\`

and:

\`fulfillmentStatus = REQUIRES_ACTION\`

This endpoint does **not**:

- create another payment
- charge the customer again
- verify the payment again

The financial payment is already considered successful.

The operation only attempts to create and attach the missing LawyerSubscription.

If the payment is already:

\`PAID + FULFILLED\`

the endpoint behaves idempotently and returns the existing payment.
`,

  security: adminSecurity,

  request: {
    params: PaymentIdParamSchema,
  },

  responses: {
    200: {
      description: "Payment fulfillment completed or was already complete.",

      content: {
        "application/json": {
          schema: AdminPaymentSuccessSchema,
        },
      },
    },

    400: badRequestResponse,
    401: unauthorizedResponse,
    403: forbiddenResponse,
    404: notFoundResponse,

    409: paymentConflictResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// POST /admin/payments/{id}/reconcile
// ========================================================

openApiRegistry.registerPath({
  method: "post",

  path: "/admin/payments/{id}/reconcile",

  operationId: "reconcileAdminPayment",

  tags: ["Admin"],

  summary: "Reconcile a pending payment with the provider",

  description: `
Compares a locally unresolved payment with the payment provider's current transaction state.

This operation is primarily intended for local payments still marked:

\`PENDING\`

after the normal browser callback flow did not fully complete.

The backend queries ZarinPal using the stored gateway authority.

Depending on the provider state, reconciliation may:

- leave the payment pending
- mark it failed
- mark it reversed
- verify a paid transaction
- recover the local PAID state
- complete subscription fulfillment

The stored local payment amount is compared with the provider amount when the provider returns one.

A mismatch is treated as a conflict and is not automatically accepted.

Reconciliation does not create a new payment and does not charge the customer again.
`,

  security: adminSecurity,

  request: {
    params: PaymentIdParamSchema,
  },

  responses: {
    200: {
      description: "Reconciliation completed.",

      content: {
        "application/json": {
          schema: PaymentReconciliationSuccessSchema,
        },
      },
    },

    400: badRequestResponse,
    401: unauthorizedResponse,
    403: forbiddenResponse,
    404: notFoundResponse,

    409: paymentConflictResponse,

    502: paymentProviderErrorResponse,

    500: serverErrorResponse,
  },
});
