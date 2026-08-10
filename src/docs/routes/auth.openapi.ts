import { openApiRegistry } from "../openapi.registry";

import {
  ApiErrorSchema,
  AuthSessionSuccessSchema,
  LogoutSuccessSchema,
  MeSuccessSchema,
  RefreshTokenSuccessSchema,
} from "../schemas/auth.openapi.schemas";

import { LoginSchema, SignupSchema } from "../../validators/auth.validator";

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
  description: "Authentication failed or the supplied token is invalid.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const forbiddenResponse = {
  description: "The account is not allowed to authenticate.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const conflictResponse = {
  description:
    "An account already exists with the submitted email or phone number.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const tooManyRequestsResponse = {
  description: "The authentication rate limit has been exceeded.",

  content: {
    "application/json": {
      schema: ApiErrorSchema,
    },
  },
};

const notFoundResponse = {
  description: "The authenticated user could not be found.",

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
// Shared Success Headers
// ========================================================

const noCacheHeaders = {
  "Cache-Control": {
    description: "Authentication responses must not be cached.",

    schema: {
      type: "string" as const,

      example: "no-store",
    },
  },

  Pragma: {
    description: "Legacy cache prevention header.",

    schema: {
      type: "string" as const,

      example: "no-cache",
    },
  },
};

const authCookieHeaders = {
  ...noCacheHeaders,

  "Set-Cookie": {
    description:
      "Sets the HttpOnly dadyar_refresh_token cookie. The refresh token is not returned in the JSON response.",

    schema: {
      type: "string" as const,
    },
  },
};

// ========================================================
// POST /auth/signup
// ========================================================

openApiRegistry.registerPath({
  method: "post",

  path: "/auth/signup",

  operationId: "signup",

  tags: ["Authentication"],

  summary: "Create an account",

  description: `
Creates a new lawyer account and immediately creates an authentication session.

### Identity

At least one of the following must be supplied:

- \`email\`
- \`phone\`

Both may be supplied during signup.

Email addresses are normalized to lowercase.

Iranian mobile numbers use the format \`09xxxxxxxxx\`. Persian and Arabic digits are normalized by the backend.

### Password

The password must contain at least 8 characters and must not exceed bcrypt's supported 72-byte UTF-8 limit.

### Tokens

A successful signup returns the **access token** in the JSON response.

The **refresh token is not returned in JSON**. It is stored in the HttpOnly \`dadyar_refresh_token\` cookie.

The refresh cookie:

- is HttpOnly
- uses SameSite=Lax
- uses the \`/api\` path
- uses the configured refresh-token lifetime
- uses Secure depending on environment configuration

### Rate limit

Signup is limited to 5 requests per hour.
`,

  request: {
    body: {
      required: true,

      content: {
        "application/json": {
          schema: SignupSchema,
        },
      },
    },
  },

  responses: {
    201: {
      description: "Account created and authentication session established.",

      headers: authCookieHeaders,

      content: {
        "application/json": {
          schema: AuthSessionSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    409: conflictResponse,

    429: tooManyRequestsResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// POST /auth/login
// ========================================================

openApiRegistry.registerPath({
  method: "post",

  path: "/auth/login",

  operationId: "login",

  tags: ["Authentication"],

  summary: "Login",

  description: `
Authenticates an existing lawyer account.

Exactly **one** login identifier must be supplied:

- \`email\`, or
- \`phone\`

Do not submit both.

### Successful authentication

The response body contains:

- the public lawyer profile
- an access token
- the access-token lifetime in seconds

The refresh token is stored in the HttpOnly \`dadyar_refresh_token\` cookie and is never exposed in the JSON response.

### Account restrictions

Suspended and rejected accounts cannot authenticate.

### Rate limit

Login allows up to 10 unsuccessful requests per 15-minute window.

Successful login requests are excluded from the failed-login rate-limit count.
`,

  request: {
    body: {
      required: true,

      content: {
        "application/json": {
          schema: LoginSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Authentication successful.",

      headers: authCookieHeaders,

      content: {
        "application/json": {
          schema: AuthSessionSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    401: unauthorizedResponse,

    403: forbiddenResponse,

    429: tooManyRequestsResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// POST /auth/refresh
// ========================================================

openApiRegistry.registerPath({
  method: "post",

  path: "/auth/refresh",

  operationId: "refreshAccessToken",

  tags: ["Authentication"],

  summary: "Refresh access token",

  description: `
Issues a new access token using the HttpOnly refresh-token cookie.

No request body is required.

The backend reads:

\`dadyar_refresh_token\`

from the request cookies.

### Refresh-token rotation

Refresh tokens are single-use for refresh operations.

When a refresh succeeds:

1. the current refresh token is consumed
2. a new access token is created
3. a new refresh token is created
4. the new refresh token replaces the existing HttpOnly cookie

The old refresh token can no longer be reused.

### Response

Only the new access token and its lifetime are returned in JSON.

The new refresh token remains HttpOnly and is returned through \`Set-Cookie\`.

### Rate limit

Refresh is limited to 30 requests per 15-minute window.
`,

  responses: {
    200: {
      description: "Access token refreshed and refresh token rotated.",

      headers: authCookieHeaders,

      content: {
        "application/json": {
          schema: RefreshTokenSuccessSchema,
        },
      },
    },

    401: unauthorizedResponse,

    403: forbiddenResponse,

    429: tooManyRequestsResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// POST /auth/logout
// ========================================================

openApiRegistry.registerPath({
  method: "post",

  path: "/auth/logout",

  operationId: "logout",

  tags: ["Authentication"],

  summary: "Logout",

  description: `
Logs out the current refresh-token session.

If a \`dadyar_refresh_token\` cookie exists, the backend attempts to revoke it.

The refresh cookie is then cleared.

This endpoint does not require an access token.

Calling logout without a refresh cookie is still successful, making logout effectively idempotent from the frontend's perspective.
`,

  responses: {
    200: {
      description: "Logout completed successfully.",

      headers: {
        ...noCacheHeaders,

        "Set-Cookie": {
          description: "Clears the dadyar_refresh_token cookie.",

          schema: {
            type: "string" as const,
          },
        },
      },

      content: {
        "application/json": {
          schema: LogoutSuccessSchema,
        },
      },
    },

    500: serverErrorResponse,
  },
});

// ========================================================
// GET /auth/me
// ========================================================

openApiRegistry.registerPath({
  method: "get",

  path: "/auth/me",

  operationId: "getCurrentUser",

  tags: ["Authentication"],

  summary: "Get current user",

  description: `
Returns the current authenticated lawyer.

This endpoint requires a valid access token:

\`Authorization: Bearer <accessToken>\`

The account is checked against the database on every authenticated request.

Suspended or rejected accounts are denied even if they still possess an otherwise valid access token.
`,

  security: [
    {
      bearerAuth: [],
    },
  ],

  responses: {
    200: {
      description: "Authenticated user returned successfully.",

      headers: noCacheHeaders,

      content: {
        "application/json": {
          schema: MeSuccessSchema,
        },
      },
    },

    401: unauthorizedResponse,

    403: forbiddenResponse,

    404: notFoundResponse,

    500: serverErrorResponse,
  },
});
