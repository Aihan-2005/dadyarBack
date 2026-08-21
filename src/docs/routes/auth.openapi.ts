import { openApiRegistry } from "../openapi.registry";

import {
  ApiErrorSchema,
  AuthSessionSuccessSchema,
  LogoutSuccessSchema,
  MeSuccessSchema,
  OtpRequestSuccessSchema,
  PasswordChangeSuccessSchema,
  RefreshTokenSuccessSchema,
} from "../schemas/auth.openapi.schemas";

import {
  ChangePasswordSchema,
  LoginSchema,
  OtpLoginSchema,
  RequestOtpLoginSchema,
  RequestPasswordChangeSchema,
  SignupSchema,
} from "../../validators/auth.validator";

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

const badGatewayResponse = {
  description:
    "The selected OTP delivery provider could not deliver the verification code.",

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
// POST /auth/otp/request
// ========================================================

openApiRegistry.registerPath({
  method: "post",

  path: "/auth/otp/request",

  operationId: "requestOtpLogin",

  tags: ["Authentication"],

  summary: "Request OTP login code",

  description: `
Requests a one-time verification code for passwordless login.

The user must submit exactly one registered identifier:

- \`phone\`
- \`email\`

The backend uses the submitted identifier as the OTP delivery destination.

### Delivery channel

The OTP delivery method depends on the submitted identifier:

- \`phone\` requests are delivered through SMS
- \`email\` requests are delivered through email

### Account privacy

This endpoint intentionally does not reveal whether an identifier belongs to an account.

A generic successful response may therefore be returned even when:

- the phone number is not registered
- the email address is not registered
- the account is not eligible to authenticate

An OTP is only delivered when the account exists and is eligible for authentication.

### OTP lifetime

The response contains:

- \`expiresIn\`: how many seconds the OTP remains valid
- \`resendAfter\`: how many seconds must pass before another OTP can be requested

Requesting another OTP after the cooldown creates a new code and invalidates the previous code.

### Rate limits

This endpoint is protected by:

- HTTP/IP rate limiting
- per-destination OTP resend cooldown

The OTP itself is also protected by a maximum verification-attempt limit.
`,

  request: {
    body: {
      required: true,

      content: {
        "application/json": {
          schema: RequestOtpLoginSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description:
        "OTP request processed. This response does not confirm whether the account exists.",

      headers: noCacheHeaders,

      content: {
        "application/json": {
          schema: OtpRequestSuccessSchema,
        },
      },
    },

    400: badRequestResponse,

    429: {
      description:
        "OTP resend cooldown or request rate limit has been exceeded.",

      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },

    502: badGatewayResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// POST /auth/otp/login
// ========================================================

openApiRegistry.registerPath({
  method: "post",

  path: "/auth/otp/login",

  operationId: "loginWithOtp",

  tags: ["Authentication"],

  summary: "Login using OTP",

  description: `
Authenticates a lawyer using their registered phone number or email address and a previously requested one-time verification code.

### Identifier

The request must contain exactly one identifier:

- \`phone\`
- \`email\`

The identifier must match the one used when requesting the OTP.

### OTP

The verification code contains exactly 6 digits.

Persian and Arabic digits are normalized by the backend.

The OTP must:

- belong to the submitted phone number or email address
- have been created for OTP login
- not be expired
- not have exceeded the allowed verification attempts

### One-time use

A successfully verified OTP is consumed immediately.

The same code cannot be used to create another authentication session.

Requesting a newer OTP also makes the previous OTP unusable.

### Failed verification

Incorrect OTP submissions increase the verification-attempt counter.

After the maximum number of attempts is reached, the OTP is invalidated and the user must request another code.

### Successful authentication

Successful OTP authentication creates exactly the same session as password login.

The JSON response contains:

- the public lawyer profile
- an access token
- the access-token lifetime

The refresh token is stored in the HttpOnly \`dadyar_refresh_token\` cookie and is not returned in JSON.

### Account restrictions

Suspended and rejected accounts cannot authenticate even if a valid OTP was previously created.
`,

  request: {
    body: {
      required: true,

      content: {
        "application/json": {
          schema: OtpLoginSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "OTP authentication successful.",

      headers: authCookieHeaders,

      content: {
        "application/json": {
          schema: AuthSessionSuccessSchema,
        },
      },
    },

    400: {
      description:
        "Invalid request, invalid OTP, expired OTP, or consumed OTP.",

      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },

    401: unauthorizedResponse,

    403: forbiddenResponse,

    429: {
      description:
        "OTP verification attempts or authentication rate limit exceeded.",

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

// ========================================================
// POST /auth/password/change/request
// ========================================================

openApiRegistry.registerPath({
  method: "post",

  path: "/auth/password/change/request",

  operationId: "requestPasswordChange",

  tags: ["Authentication"],

  summary: "Request password-change OTP",

  description: `
Sends a one-time verification code for changing the authenticated lawyer's password.

This endpoint requires a valid access token.

### Request body

The client must specify the preferred verification channel:

\`channel\`:

- \`phone\`: sends the OTP to the authenticated user's registered phone number
- \`email\`: sends the OTP to the authenticated user's registered email address

Example:

\`\`\`json
{
  "channel": "email"
}
\`\`\`

or:

\`\`\`json
{
  "channel": "phone"
}
\`\`\`

### Contact information

The client does not provide:

- phone number
- email address
- user ID

The backend retrieves the corresponding contact information from the authenticated account.

### Requirements

The authenticated account must have the selected contact method configured.

For example:

- selecting \`phone\` requires a registered phone number
- selecting \`email\` requires a registered email address

### OTP purpose

The generated OTP is created specifically for:

\`PASSWORD_CHANGE\`

It cannot be used for OTP login or other OTP-protected operations.

### Response

The response contains:

- \`expiresIn\`: how long the OTP remains valid
- \`resendAfter\`: how long the user must wait before requesting another OTP

### Security

This endpoint is protected by:

- access-token authentication
- HTTP rate limiting
- per-destination OTP resend cooldown
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
          schema: RequestPasswordChangeSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Password-change OTP sent successfully.",

      headers: noCacheHeaders,

      content: {
        "application/json": {
          schema: OtpRequestSuccessSchema,
        },
      },
    },

    400: {
      description:
        "The authenticated account does not have a phone number or the request is otherwise invalid.",

      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },

    401: unauthorizedResponse,

    403: forbiddenResponse,

    404: notFoundResponse,

    429: {
      description:
        "OTP resend cooldown or password-change request rate limit exceeded.",

      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },

    502: badGatewayResponse,

    500: serverErrorResponse,
  },
});

// ========================================================
// PATCH /auth/password
// ========================================================

openApiRegistry.registerPath({
  method: "patch",

  path: "/auth/password",

  operationId: "changePassword",

  tags: ["Authentication"],

  summary: "Change password using OTP",

  description: `
Changes the authenticated lawyer's password after verifying a password-change OTP.

This endpoint requires a valid access token.

### Request

The client submits:

- \`channel\`: the OTP delivery channel used for verification
- \`code\`: the 6-digit verification code
- \`newPassword\`: the new account password

The client does not submit:

- phone number
- email address
- user ID

Those values are derived by the backend from the authenticated account.

### OTP verification

The submitted code must:

- belong to the authenticated user's selected verification channel
- have been generated for \`PASSWORD_CHANGE\`
- not be expired
- not have exceeded the allowed verification attempts
- not have already been consumed

A successfully verified OTP is consumed immediately and cannot be reused.

### Password

The new password follows the same password requirements used during signup.

### Session security

After the password is changed:

1. all existing refresh-token sessions belonging to the user are revoked
2. a fresh access token is generated
3. a fresh refresh token is generated
4. the new refresh token is stored in the HttpOnly refresh cookie

Previously issued access tokens may remain valid until their normal short expiration time.

### Current session

The current client remains authenticated because a new token pair is returned after the password change.
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
          schema: ChangePasswordSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description:
        "Password changed successfully and a fresh authentication session was issued.",

      headers: authCookieHeaders,

      content: {
        "application/json": {
          schema: PasswordChangeSuccessSchema,
        },
      },
    },

    400: {
      description:
        "Invalid request, invalid OTP, expired OTP, or missing account phone number.",

      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },

    401: unauthorizedResponse,

    403: forbiddenResponse,

    404: notFoundResponse,

    429: {
      description:
        "OTP verification attempts or password-change rate limit exceeded.",

      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },

    500: serverErrorResponse,
  },
});
