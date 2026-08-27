import { Router } from "express";

import TicketController from "../controllers/ticket.controller";
import TicketMessageController from "../controllers/ticketMessage.controller";

import type { Route } from "../interfaces/routes.interface";

import requireAuth from "../middlewares/auth.middleware";

import { uploadAttachment } from "../middlewares/upload.middleware";

import { TicketService } from "../services/ticket.service";
import { TicketMessageService } from "../services/ticketMessage.service";

class TicketRoute implements Route {
  public path = "/tickets";

  public router = Router();

  private readonly ticketController = new TicketController(new TicketService());
  private readonly ticketMessageController = new TicketMessageController(
    new TicketMessageService(),
  );

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
      "/:id/messages/:messageId/attachment",
      this.ticketController.getAttachmentDownloadUrl,
    );

    this.router.get("/:id/messages", this.ticketMessageController.listMessages);

    this.router.post(
      "/:id/messages",
      uploadAttachment,
      this.ticketMessageController.addMessage,
    );

    this.router.get("/:id", this.ticketController.getTicket);
  }
}

export default TicketRoute;
