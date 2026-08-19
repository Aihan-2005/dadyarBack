import { NextFunction, Request, Response } from "express";

import { NotificationService } from "../services/notification.service";
import { HttpException } from "../exceptions/httpException";
import { MESSAGES } from "../constants/messages.constants";
import { env } from "../config/env";

import {
  CreateReminderSchema,
  ParamNotificationIdSchema,
} from "../validators/notification.validator";

const LANGUAGE = env.LANGUAGE;

class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  private getLawyerId(req: Request) {
    const lawyerId = req.user?.id;

    if (!lawyerId) {
      throw new HttpException(401, MESSAGES.unauthorized[LANGUAGE]);
    }

    return lawyerId;
  }

    public addReminder = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const lawyerId = this.getLawyerId(req);

      const data = CreateReminderSchema.parse(req.body || {});

      const notification = await this.notificationService.addReminder(
        lawyerId,
        data,
      );

      return res.status(201).json({
        success: true,
        data: notification,
      });
    } catch (err) {
      next(err);
    }
  };

    public listNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const lawyerId = this.getLawyerId(req);

      const notifications = await this.notificationService.listNotifications(
        lawyerId,
      );

      return res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (err) {
      next(err);
    }
  };


    public markAsRead = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { id } = ParamNotificationIdSchema.parse(req.params);

      const notification = await this.notificationService.markAsRead(
        lawyerId,
        id,
      );

      return res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (err) {
      next(err);
    }
  };

    public markAsCompleted = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { id } = ParamNotificationIdSchema.parse(req.params);

      const notification = await this.notificationService.markAsCompleted(
        lawyerId,
        id,
      );

      return res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (err) {
      next(err);
    }
  };

  public dismiss = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { id } = ParamNotificationIdSchema.parse(req.params);

      const notification = await this.notificationService.dismiss(
        lawyerId,
        id,
      );

      return res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (err) {
      next(err);
    }
  };

    public markAllAsRead = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const lawyerId = this.getLawyerId(req);

      const notifications = await this.notificationService.markAllAsRead(
        lawyerId,
      );

      return res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (err) {
      next(err);
    }
  };


    public deleteNotification = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { id } = ParamNotificationIdSchema.parse(req.params);

      const result = await this.notificationService.deleteNotification(
        lawyerId,
        id,
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
}

export default NotificationController;