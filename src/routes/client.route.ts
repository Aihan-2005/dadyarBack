import { Router } from "express";

import { ClientController } from "../controller/client.controller";

import type { Route } from "../interfaces/routes.interface";

import requireAuth from "../middlewere/auth.middlewere";

import { ClientService } from "../services/client.service";

class ClientRoute implements Route {
  public readonly path = "/clients";

  public readonly router = Router();

  private readonly clientController: ClientController;

  constructor() {
    const clientService = new ClientService();

    this.clientController = new ClientController(clientService);

    this.initializeMiddlewares();

    this.initializeRoutes();
  }

  private initializeMiddlewares(): void {
    this.router.use(requireAuth);
  }

  private initializeRoutes(): void {
    // ---------------- Create ----------------

    this.router.post("/", this.clientController.createClient);

    // ---------------- Read ----------------

    this.router.get("/", this.clientController.listClients);

    this.router.get("/lookup", this.clientController.lookupByPhone);

    this.router.get("/:clientId", this.clientController.getClientById);

    // ---------------- Update ----------------

    this.router.patch("/:clientId", this.clientController.updateClient);
  }
}

export default ClientRoute;
