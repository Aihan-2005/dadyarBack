import { openApiRegistry } from "../openapi.registry";

import {
  ApiErrorSchema,
  LawyerMeSuccessSchema,
  LawyerProfileSuccessSchema,
} from "../schemas/lawyer.openapi.schemas";

import { LawyerProfileSchema } from "../../validators/lawyer.validator";

// ========================================================
// Shared Responses
// ========================================================

const badRequestResponse = {
  description: "The submitted profile data is invalid.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const unauthorizedResponse = {
  description: "A valid access token is required.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const forbiddenResponse = {
  description: "The account is not allowed to access this resource.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const notFoundResponse = {
  description: "The authenticated lawyer could not be found.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const conflictResponse = {
  description:
    "The submitted phone number or license number is already used by another lawyer.",

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
// GET /lawyers/me
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/lawyers/me",

  operationId: "getCurrentLawyer",

  tags: ["Lawyer Profile"],

  summary: "Get current lawyer",

  description: `
Returns the complete public representation of the authenticated lawyer.

The response includes:

- basic account information
- role and account status
- verification states
- lawyer profile
- last login time
- creation and update timestamps

Sensitive fields such as the password are never returned.
`,

  security: [
    {
      bearerAuth: [],
    },
  ],

  responses: {
    200: {
      description: "Lawyer returned successfully.",

      content: {
        "application/json": {
          schema: LawyerMeSuccessSchema,
        },
      },
    },

    401: unauthorizedResponse,

    403: forbiddenResponse,

    404: notFoundResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// GET /lawyers/me/profile
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/lawyers/me/profile",

  operationId: "getLawyerProfile",

  tags: ["Lawyer Profile"],

  summary: "Get lawyer profile",

  description: `
Returns only the editable professional profile of the authenticated lawyer.

The profile includes:

- specialization
- license number
- years of experience
- phone
- website
- address
- biography
- education
- work experience
- skills
- languages
`,

  security: [
    {
      bearerAuth: [],
    },
  ],

  responses: {
    200: {
      description: "Lawyer profile returned successfully.",

      content: {
        "application/json": {
          schema: LawyerProfileSuccessSchema,
        },
      },
    },

    401: unauthorizedResponse,

    403: forbiddenResponse,

    404: notFoundResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// PUT /lawyers/me/profile
// ========================================================

openApiRegistry.registerPath({
  method: "put",

  path: "/lawyers/me/profile",

  operationId: "replaceLawyerProfile",

  tags: ["Lawyer Profile"],

  summary: "Replace lawyer profile",

  description: `
Updates the authenticated lawyer's professional profile.

The submitted profile is treated as the desired profile state.

### Phone

The phone number must be a valid Iranian mobile number in the form:

\`09xxxxxxxxx\`

Persian and Arabic digits are normalized automatically.

If the phone number changes:

- the previous phone verification is invalidated
- \`phoneVerifiedAt\` is reset

The new phone number must not already belong to another lawyer.

At least one account identity must remain available. A lawyer cannot remove the phone number if the account also has no email.

### License number

The license number must be unique when provided.

If the license number changes:

- license verification is invalidated
- \`licenseVerifiedAt\` is reset
- an ACTIVE account is moved back to \`PENDING_VERIFICATION\`

### Website

A website without an HTTP scheme is automatically normalized.

For example:

\`example.com\`

becomes:

\`https://example.com\`

### Education / Experience / Skills

Existing nested records may include their \`id\`.

When a valid existing MongoDB ID is submitted, the backend preserves it.

New entries may omit \`id\`, in which case MongoDB creates a new subdocument identifier.

### Languages

Duplicate languages are removed case-insensitively.
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
          schema: LawyerProfileSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Lawyer profile updated successfully.",

      content: {
        "application/json": {
          schema: LawyerProfileSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    403: forbiddenResponse,

    404: notFoundResponse,

    409: conflictResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// PATCH /lawyers/me/profile
// ========================================================

openApiRegistry.registerPath({
  method: "patch",

  path: "/lawyers/me/profile",

  operationId: "updateLawyerProfile",

  tags: ["Lawyer Profile"],

  summary: "Update lawyer profile",

  description: `
Updates the authenticated lawyer's professional profile.

**Important:** despite using PATCH, the current backend uses the same complete \`LawyerProfileSchema\` and update logic as PUT.

Omitted profile fields may therefore be normalized to empty/default values rather than being preserved.

This endpoint currently behaves more like a profile replacement than a true partial PATCH.

The same uniqueness, verification-reset, normalization, and nested-record rules documented for PUT apply here.
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
          schema: LawyerProfileSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Lawyer profile updated successfully.",

      content: {
        "application/json": {
          schema: LawyerProfileSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    403: forbiddenResponse,

    404: notFoundResponse,

    409: conflictResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// PATCH /lawyers/me
// ========================================================

openApiRegistry.registerPath({
  method: "patch",

  path: "/lawyers/me",

  operationId: "updateCurrentLawyerProfile",

  tags: ["Lawyer Profile"],

  summary: "Update current lawyer profile",

  description: `
Alternative route for updating the authenticated lawyer's profile.

It currently calls the exact same controller, validator, and service method as:

\`PATCH /lawyers/me/profile\`

Therefore it has the same profile-replacement behavior and validation rules.
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
          schema: LawyerProfileSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Lawyer profile updated successfully.",

      content: {
        "application/json": {
          schema: LawyerProfileSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    403: forbiddenResponse,

    404: notFoundResponse,

    409: conflictResponse,

    500: serverErrorResponse,
  },
});
