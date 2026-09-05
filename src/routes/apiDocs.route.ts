import { Router } from "express";

import swaggerUi from "swagger-ui-express";

import { env } from "../config/env";

import { openApiDocument } from "../docs/openapi";

import type { Route } from "../interfaces/route.interface";

import { requireAuth, requireRole } from "../middlewares/auth.middleware";

export class ApiDocsRoute implements Route {
  public path = "/docs";

  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.initializeProtection();

    // ---------------- Raw OpenAPI JSON ----------------

    this.router.get("/openapi.json", (_req, res) => {
      return res.status(200).json(openApiDocument);
    });

    // ---------------- Swagger UI ----------------

    this.router.use("/", swaggerUi.serve);

    this.router.get(
      "/",
      swaggerUi.setup(openApiDocument, {
        customSiteTitle: "Dadyar API Docs",

        swaggerOptions: {
          displayRequestDuration: true,

          persistAuthorization: true,
        },
      }),
    );
  }

  private initializeProtection(): void {
    if (env.ENABLE_API_DOCS) {
      return;
    }

    this.router.use(requireAuth, requireRole("ADMIN"));
  }
}
