import { Router } from "express";

import type { Route } from "../interfaces/route.interface";

import { AdminController } from "../controllers/admin.controller";

import TicketController from "../controllers/ticket.controller";

import TicketMessageController from "../controllers/ticketMessage.controller";

import { AdminService } from "../services/admin.service";

import { TicketService } from "../services/ticket.service";

import { TicketMessageService } from "../services/ticketMessage.service";

import { SubscriptionPlanController } from "../controllers/subscriptionPlan.controller";

import { SubscriptionPlanService } from "../services/subscriptionPlan.service";

import requireAuth, { requireRole } from "../middlewares/auth.middleware";

import { uploadAttachment } from "../middlewares/upload.middleware";
import { LawyerSubscriptionController } from "../controllers/lawyerSubscription.controller";
import { PaymentController } from "../controllers/payment.controller";

export class AdminRoute implements Route {
  public path = "/admin";

  public router = Router();

  private readonly adminController = new AdminController(new AdminService());

  private readonly ticketController = new TicketController(new TicketService());

  private readonly ticketMessageController = new TicketMessageController(
    new TicketMessageService(),
  );

  private readonly subscriptionPlanController = new SubscriptionPlanController(
    new SubscriptionPlanService(),
  );

  private readonly lawyerSubscriptionController =
    new LawyerSubscriptionController();

  private readonly paymentController = new PaymentController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use(requireAuth, requireRole("ADMIN"));

    this.router.get("/dashboard", this.adminController.getDashboard);

    this.router.post("/lawyers", this.adminController.createLawyer);

    this.router.get("/lawyers", this.adminController.listLawyers);

    this.router.patch(
      "/lawyers/:id/status",
      this.adminController.updateLawyerStatus,
    );

    this.router.patch(
      "/lawyers/:id/account-status",
      this.adminController.updateLawyerAccountStatus,
    );

    this.router.patch(
      "/lawyers/:id/password",
      this.adminController.resetLawyerPassword,
    );

    this.router.get("/lawyers/:id", this.adminController.getLawyer);

    // Client lawyer directory
    this.router.get("/client-lawyers", this.adminController.listClientLawyers);

    this.router.post(
      "/client-lawyers/:id",
      this.adminController.publishClientLawyer,
    );

    this.router.patch(
      "/client-lawyers/:id",
      this.adminController.updateClientLawyer,
    );

    this.router.delete(
      "/client-lawyers/:id",
      this.adminController.removeClientLawyer,
    );

    // Clients
    this.router.get("/clients", this.adminController.listClients);

    this.router.patch(
      "/clients/:id/account-status",
      this.adminController.updateClientAccountStatus,
    );

    this.router.patch(
      "/clients/:id/password",
      this.adminController.resetClientPassword,
    );

    this.router.get("/clients/:id", this.adminController.getClient);

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

    // Subscription plans
    this.router.get(
      "/subscription-plans/options",
      this.subscriptionPlanController.getPlanOptions,
    );
    this.router.get(
      "/subscription-plans/settings",
      this.subscriptionPlanController.getSettings,
    );

    this.router.patch(
      "/subscription-plans/settings",
      this.subscriptionPlanController.updateSettings,
    );

    this.router.get(
      "/subscription-plans",
      this.subscriptionPlanController.listPlansForAdmin,
    );

    this.router.post(
      "/subscription-plans",
      this.subscriptionPlanController.createPlan,
    );

    this.router.patch(
      "/subscription-plans/:id",
      this.subscriptionPlanController.updatePlan,
    );

    // Lawyer subscriptions
    this.router.get(
      "/lawyers/:id/subscriptions",

      this.lawyerSubscriptionController.getSubscriptionHistoryForAdmin,
    );

    this.router.post(
      "/lawyers/:id/subscriptions",

      this.lawyerSubscriptionController.createSubscriptionForAdmin,
    );

    this.router.patch(
      "/lawyers/:id/subscriptions/current/cancel",

      this.lawyerSubscriptionController.cancelCurrentSubscriptionForAdmin,
    );

    // Payments
    this.router.get(
      "/payments",

      this.paymentController.listPaymentsForAdmin,
    );

    this.router.get(
      "/payments/:id",

      this.paymentController.getPaymentForAdmin,
    );

    this.router.post(
      "/payments/:id/retry-fulfillment",

      this.paymentController.retryPaymentFulfillmentForAdmin,
    );

    this.router.post(
      "/payments/:id/reconcile",

      this.paymentController.reconcilePaymentForAdmin,
    );
  }
}
