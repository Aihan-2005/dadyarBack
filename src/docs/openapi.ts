import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";

import { openApiRegistry } from "./openapi.registry";

/*
 * Important:
 *
 * Route documentation files register themselves
 * into openApiRegistry when imported.
 */
import "./routes";

const generator = new OpenApiGeneratorV3(openApiRegistry.definitions);

export const openApiDocument = generator.generateDocument({
  openapi: "3.0.3",

  info: {
    title: "Dadyar API",

    version: "1.0.0",

    description: "API documentation for the Dadyar backend.",
  },
});
