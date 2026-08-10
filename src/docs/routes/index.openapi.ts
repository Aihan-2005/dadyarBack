import { z } from "zod";

import { openApiRegistry } from "../openapi.registry";

const IndexSuccessSchema = openApiRegistry.register(
  "IndexSuccess",

  z.object({
    success: z.literal(true),

    message: z.string(),
  }),
);

openApiRegistry.registerPath({
  method: "get",

  path: "/",

  operationId: "getApiIndex",

  tags: ["System"],

  summary: "API root",

  description: "Returns a basic response confirming that the API is reachable.",

  responses: {
    200: {
      description: "API is reachable.",

      content: {
        "application/json": {
          schema: IndexSuccessSchema,
        },
      },
    },
  },
});
