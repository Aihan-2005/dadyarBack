import { Router } from "express";

import { ClientCaseController } from "../controllers/clientCase.controller";

import type { Route } from "../interfaces/routes.interface";

import requireAuth, { requireRole } from "../middlewares/auth.middleware";

import { ClientCaseService } from "../services/clientCase.service";

class ClientCaseRoute implements Route {
  public readonly path = "/client/cases";

  public readonly router = Router();

  private readonly controller: ClientCaseController;

  constructor() {
    this.controller = new ClientCaseController(new ClientCaseService());

    this.initializeMiddlewares();

    this.initializeRoutes();
  }

  private initializeMiddlewares(): void {
    this.router.use(
      requireAuth,

      requireRole("CLIENT"),
    );
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",

      this.controller.listCases,
    );

    this.router.get(
      "/:caseId",

      this.controller.getCaseById,
    );
  }
}

export default ClientCaseRoute;
