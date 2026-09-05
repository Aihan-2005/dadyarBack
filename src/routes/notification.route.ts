import { Router } from "express";
import NotificationController from "../controllers/notification.controller";
import { NotificationService } from "../services/notification.service";
import { Route } from "../interfaces/route.interface";
import requireAuth, { requireRole } from "../middlewares/auth.middleware";

class NotificationRoute implements Route {
  public path = "/notifications";
  public router = Router();

  private readonly notificationController = new NotificationController(
    new NotificationService(),
  );

  constructor() {
    this.authRoutes();
    this.initilizeRoutes();
  }

  private authRoutes() {
    this.router.use(requireAuth, requireRole("LAWYER"));
  }

  private initilizeRoutes() {
    this.router.post("/reminders", this.notificationController.addReminder);

    this.router.get("/", this.notificationController.listNotifications);

    this.router.patch("/read-all", this.notificationController.markAllAsRead);

    this.router.patch("/:id/read", this.notificationController.markAsRead);

    this.router.patch(
      "/:id/complete",
      this.notificationController.markAsCompleted,
    );

    this.router.patch("/:id/dismiss", this.notificationController.dismiss);

    this.router.delete("/:id", this.notificationController.deleteNotification);
  }
}

export default NotificationRoute;
