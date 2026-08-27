import { Router } from "express";

import TicketController from "../controllers/ticket.controller";

import type { Route } from "../interfaces/routes.interface";

import requireAuth from "../middlewares/auth.middleware";

import { uploadAttachment } from "../middlewares/upload.middleware";

import { TicketService } from "../services/ticket.service";

class TicketRoute implements Route {
  public path = "/tickets";

  public router = Router();

  private readonly ticketController = new TicketController(new TicketService());

  constructor() {
    this.authRoutes();

    this.initilizeRoutes();
  }

  private authRoutes() {
    this.router.use(requireAuth);
  }

  private initilizeRoutes() {
    this.router.post("/", uploadAttachment, this.ticketController.createTicket);

    this.router.get("/", this.ticketController.listTickets);

    this.router.get(
      "/:id/attachment",
      this.ticketController.getAttachmentDownloadUrl,
    );

    this.router.get("/:id", this.ticketController.getTicket);
  }
}

export default TicketRoute;
