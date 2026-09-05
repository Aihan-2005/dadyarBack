import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";

import { openApiRegistry } from "./openapi.registry";

/*
 * Important:
 *
 * Route documentation files register themselves
 * into openApiRegistry when imported.
 */
import "./routes";
import { API_PREFIX } from "../constants/route.constants";

const generator = new OpenApiGeneratorV3(openApiRegistry.definitions);

export const openApiDocument = generator.generateDocument({
  openapi: "3.0.3",

  info: {
    title: "Dadyar API",

    version: "1.0.0",

    description: `
API documentation for the Dadyar backend.

## Authentication

Protected API operations use JWT bearer authentication:

\`Authorization: Bearer <accessToken>\`

Role requirements are documented per endpoint.

## Administration API

Routes under:

\`/admin/*\`

require an authenticated User whose role is:

\`ADMIN\`

The admin API includes:

- dashboard statistics
- lawyer search and filtering
- lawyer professional verification/status management
- lawyer account suspension/reactivation
- lawyer password reset
- client search and filtering
- client account suspension/reactivation
- client password reset
- support ticket administration
- admin ticket replies and attachment access

## API documentation access

The Swagger UI and raw OpenAPI document are always mounted under:

\`/docs\`

and:

\`/docs/openapi.json\`

Their access policy depends on:

\`ENABLE_API_DOCS\`

### ENABLE_API_DOCS=true

API documentation is publicly accessible.

### ENABLE_API_DOCS=false

API documentation requires:

- a valid bearer access token
- User role \`ADMIN\`

The same protection applies to both the Swagger UI and the raw OpenAPI JSON document.
`,
  },

  servers: [
    {
      url: API_PREFIX,

      description: "Dadyar API",
    },
  ],
});
