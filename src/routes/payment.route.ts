import { Router } from "express";

import { PaymentController } from "../controllers/payment.controller";

import type { Route } from "../interfaces/route.interface";

import requireAuth, {
  requireActiveLawyer,
  requireRole,
} from "../middlewares/auth.middleware";

export class PaymentRoute implements Route {
  public path = "/payments";

  public router = Router();

  constructor(
    private readonly controller: PaymentController = new PaymentController(),
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/zarinpal/callback",

      this.controller.handleZarinPalCallback,
    );

    this.router.post(
      "/subscriptions",

      requireAuth,

      requireRole("LAWYER"),

      requireActiveLawyer,

      this.controller.createSubscriptionPayment,
    );
  }
}
