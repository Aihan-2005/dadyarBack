import { Router } from "express";

import { LawyerClientController } from "../controllers/lawyerClient.controller";

import type { Route } from "../interfaces/routes.interface";

import requireAuth, { requireRole } from "../middlewares/auth.middleware";

import { LawyerClientService } from "../services/lawyerClient.service";

class LawyerClientRoute implements Route {
  public readonly path = "/clients";

  public readonly router = Router();

  private readonly lawyerClientController: LawyerClientController;

  constructor() {
    const lawyerClientService = new LawyerClientService();

    this.lawyerClientController = new LawyerClientController(
      lawyerClientService,
    );

    this.authRoutes();

    this.initializeRoutes();
  }

  private authRoutes() {
    this.router.use(requireAuth, requireRole("LAWYER"));
  }

  private initializeRoutes(): void {
    // ---------------- Create ----------------

    this.router.post("/", this.lawyerClientController.createClient);

    // ---------------- Read ----------------

    this.router.get("/", this.lawyerClientController.listClients);

    this.router.get("/lookup", this.lawyerClientController.lookupByPhone);

    this.router.get("/:clientId", this.lawyerClientController.getClientById);

    // ---------------- Update ----------------

    this.router.patch("/:clientId", this.lawyerClientController.updateClient);
  }
}

export default LawyerClientRoute;
