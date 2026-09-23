import {
  Router,
} from "express";

import {
  SubscriptionPlanController,
} from "../controllers/subscriptionPlan.controller";

import type {
  Route,
} from "../interfaces/route.interface";

export class SubscriptionPlanRoute implements Route {
  public path =
    "/subscription-plans";

  public router =
    Router();

  constructor(
    private readonly controller:
      SubscriptionPlanController =
        new SubscriptionPlanController(),
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes():
    void {
    this.router.get(
      "/",

      this.controller
        .listPublicPlans,
    );

   
    this.router.get(
      "/settings",

      this.controller
        .getSettings,
    );

    this.router.get(
      "/:id",

      this.controller
        .getPublicPlan,
    );
  }
}