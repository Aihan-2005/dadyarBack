import { Router } from "express";

import { LawyerController } from "../controllers/lawyer.controller";

import type { Route } from "../interfaces/routes.interface";

import requireAuth from "../middlewares/auth.middleware";

import { LawyerService } from "../services/lawyer.service";

class LawyerRoute implements Route {
  public readonly path = "/lawyers";

  public readonly router = Router();

  private readonly lawyerController: LawyerController;

  constructor() {
    const lawyerService = new LawyerService();

    this.lawyerController = new LawyerController(lawyerService);

    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  private initializeMiddlewares(): void {
    this.router.use(requireAuth);
  }

  private initializeRoutes(): void {
    this.router.get("/me", this.lawyerController.me);

    /**
     * مسیر اصلی مورد استفاده فرانت.
     */
    this.router.put("/me/profile", this.lawyerController.updateProfile);

    /**
     * سازگاری موقت با route قبلی.
     */
    this.router.patch("/me", this.lawyerController.updateProfile);
  }
}

export default LawyerRoute;
