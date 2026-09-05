import type { Route } from "../interfaces/route.interface";
import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { AdminService } from "../services/admin.service";
import requireAuth, { requireRole } from "../middlewares/auth.middleware";
import TicketController from "../controllers/ticket.controller";
import { TicketService } from "../services/ticket.service";
import TicketMessageController from "../controllers/ticketMessage.controller";
import { TicketMessageService } from "../services/ticketMessage.service";
import { uploadAttachment } from "../middlewares/upload.middleware";

export class AdminRoute implements Route {
  public path = "/admin";
  public router = Router();

  private readonly adminController = new AdminController(new AdminService());

  private readonly ticketController = new TicketController(new TicketService());

  private readonly ticketMessageController = new TicketMessageController(
    new TicketMessageService(),
  );

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use(requireAuth, requireRole("ADMIN"));

    // ---------------- Dashboard ----------------

    this.router.get("/dashboard", this.adminController.getDashboard);

    // ---------------- Lawyers ----------------

    this.router.get("/lawyers", this.adminController.listLawyers);

    this.router.patch(
      "/lawyers/:id/status",
      this.adminController.updateLawyerStatus,
    );

    this.router.patch(
      "/lawyers/:id/account-status",
      this.adminController.updateLawyerAccountStatus,
    );

    this.router.get("/lawyers/:id", this.adminController.getLawyer);

    // ---------------- Clients ----------------

    this.router.get("/clients", this.adminController.listClients);

    this.router.patch(
      "/clients/:id/account-status",
      this.adminController.updateClientAccountStatus,
    );

    this.router.get("/clients/:id", this.adminController.getClient);

    // ---------------- Tickets ----------------

    this.router.get("/tickets", this.ticketController.listTicketsForAdmin);

    this.router.get("/tickets/:id", this.ticketController.getTicketForAdmin);

    this.router.patch(
      "/tickets/:id/status",
      this.ticketController.updateTicketStatusForAdmin,
    );

    this.router.get(
      "/tickets/:id/messages",
      this.ticketMessageController.listMessagesForAdmin,
    );

    this.router.post(
      "/tickets/:id/messages",
      uploadAttachment,
      this.ticketMessageController.addAdminMessage,
    );

    this.router.get(
      "/tickets/:id/messages/:messageId/attachment",
      this.ticketMessageController.getAttachmentDownloadUrlForAdmin,
    );
  }
}
