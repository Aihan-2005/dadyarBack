import { Router } from "express";

import type { Route } from "../interfaces/route.interface";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

export class AdminRoute implements Route {
  public path = "/admin";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use(requireAuth, requireRole("ADMIN"));
  }
}
