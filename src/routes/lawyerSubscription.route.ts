import { Router } from "express";

import { LawyerSubscriptionController } from "../controllers/lawyerSubscription.controller";

import type { Route } from "../interfaces/route.interface";

import requireAuth, { requireRole } from "../middlewares/auth.middleware";

export class LawyerSubscriptionRoute implements Route {
  public path = "/lawyer-subscriptions";

  public router = Router();

  constructor(
    private readonly controller: LawyerSubscriptionController = new LawyerSubscriptionController(),
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use(
      requireAuth,

      requireRole("LAWYER"),
    );

    this.router.get(
      "/current",

      this.controller.getCurrentSubscription,
    );
  }
}
