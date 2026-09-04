import type { Route } from "../interfaces/route.interface";
import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { AdminService } from "../services/admin.service";
import requireAuth, { requireRole } from "../middlewares/auth.middleware";

export class AdminRoute implements Route {
  public path = "/admin";
  public router = Router();

  private readonly adminController = new AdminController(new AdminService());

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use(requireAuth, requireRole("ADMIN"));

    this.router.get("/lawyers", this.adminController.listLawyers);

    this.router.get("/lawyers/:id", this.adminController.getLawyer);

    this.router.get("/clients", this.adminController.listClients);

    this.router.get("/clients/:id", this.adminController.getClient);
  }
}
