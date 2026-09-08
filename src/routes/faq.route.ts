import type { Route } from "../interfaces/route.interface";
import { FAQController } from "../controllers/faq.controller";
import { Router } from "express";
import requireAuth, { requireRole } from "../middlewares/auth.middleware";

export class FAQRoute implements Route {
  public path = "/faq";
  public router = Router();

  constructor(
    private readonly controller: FAQController = new FAQController(),
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/", this.controller.listFAQ);
    this.router.post(
      "/",
      requireAuth,
      requireRole("ADMIN"),
      this.controller.createFAQ,
    );
    this.router.delete(
      "/:id",
      requireAuth,
      requireRole("ADMIN"),
      this.controller.deleteFAQ,
    );
  }
}
