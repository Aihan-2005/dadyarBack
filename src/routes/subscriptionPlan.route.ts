import { Router } from "express";

import { SubscriptionPlanController } from "../controllers/subscriptionPlan.controller";

import type { Route } from "../interfaces/route.interface";

import requireAuth, { requireRole } from "../middlewares/auth.middleware";

export class SubscriptionPlanRoute implements Route {
  public path = "/subscription-plans";

  public router = Router();

  constructor(
    private readonly controller: SubscriptionPlanController = new SubscriptionPlanController(),
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/", this.controller.listPublicPlans);

    this.router.get("/:id", this.controller.getPublicPlan);
  }
}

export class AdminSubscriptionPlanRoute implements Route {
  public path = "/admin/subscription-plans";

  public router = Router();

  constructor(
    private readonly controller: SubscriptionPlanController = new SubscriptionPlanController(),
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use(
      requireAuth,

      requireRole("ADMIN"),
    );

    this.router.get("/", this.controller.listPlansForAdmin);

    this.router.post("/", this.controller.createPlan);

    this.router.get("/options", this.controller.getPlanOptions);

    this.router.patch("/:id", this.controller.updatePlan);
  }
}
