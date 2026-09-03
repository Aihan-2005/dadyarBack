import { Router } from "express";

import type { Route } from "../interfaces/route.interface";

import { FinancialReportController } from "../controllers/financialReport.controller";

import requireAuth, { requireRole } from "../middlewares/auth.middleware";

export class FinancialReportRoute implements Route {
  public path = "/finance";

  public router = Router();

  private readonly controller = new FinancialReportController();

  constructor() {
    this.initializeRoutes();
  }

  private authRoutes() {
    this.router.use(requireAuth, requireRole("LAWYER"));
  }

  private initializeRoutes(): void {
    this.authRoutes();

    // ---------------- Summary ----------------

    this.router.get(
      "/summary",

      this.controller.getSummary,
    );

    // ---------------- Clients ----------------

    this.router.get(
      "/clients",

      this.controller.getClientFinancialReport,
    );

    this.router.get(
      "/clients/:clientId/cases",

      this.controller.getClientCaseFinancialReport,
    );
  }
}
