import { Router } from "express";
import swaggerUi from "swagger-ui-express";

import type { Route } from "../interfaces/routes.interface";
import { openApiDocument } from "../docs/openapi";

export class ApiDocsRoute implements Route {
  public path = "/docs";

  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/openapi.json", (_req, res) => {
      return res.status(200).json(openApiDocument);
    });

    this.router.use(
      "/",
      swaggerUi.serve,
      swaggerUi.setup(openApiDocument, {
        customSiteTitle: "Dadyar API Docs",

        swaggerOptions: {
          displayRequestDuration: true,
        },
      }),
    );
  }
}
