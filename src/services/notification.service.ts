import { MESSAGES } from "../constants/messages.constants";
import {
  CreateReminderInput,
  CreateReminderPayload,
} from "../interfaces/notification.interface";
import { HttpException } from "../exceptions/httpException";
import { NotificationRepository } from "../repositories/notification.repository";
import { env } from "../config/env";
const LANGUAGE = env.LANGUAGE;

export class NotificationService {
  private readonly notificationRepository: NotificationRepository =
    new NotificationRepository();

  private async ensureNotificationBelongsToLawyer(
    lawyerId: string,
    notificationId: string,
  ) {
    const existingNotification =
      await this.notificationRepository.findByIdForLawyer(
        lawyerId,
        notificationId,
      );

    if (!existingNotification) {
      throw new HttpException(404, MESSAGES.notificationNotFound[LANGUAGE]);
    }

    return existingNotification;
  }

  public async addReminder(lawyerId: string, data: CreateReminderPayload) {
    const type = data.target === "client" ? "client_reminder" : "reminder";

    const createData: CreateReminderInput = {
      ...data,
      lawyerId,
      type,
    };

    return this.notificationRepository.create(createData);
  }

  public async listNotifications(lawyerId: string) {
    return this.notificationRepository.findByLawyerId(lawyerId);
  }

  public async markAsRead(lawyerId: string, notificationId: string) {
    await this.ensureNotificationBelongsToLawyer(lawyerId, notificationId);

    return this.notificationRepository.markRead(lawyerId, notificationId);
  }

  public async markAsCompleted(lawyerId: string, notificationId: string) {
    const existingNotification = await this.ensureNotificationBelongsToLawyer(
      lawyerId,
      notificationId,
    );

    return this.notificationRepository.setCompleted(
      lawyerId,
      notificationId,
      !existingNotification.completed,
    );
  }

  public async dismiss(lawyerId: string, notificationId: string) {
    await this.ensureNotificationBelongsToLawyer(lawyerId, notificationId);

    return this.notificationRepository.markDismissed(
      lawyerId,
      notificationId,
    );
  }

  public async markAllAsRead(lawyerId: string) {
    await this.notificationRepository.markAllRead(lawyerId);

    return this.notificationRepository.findByLawyerId(lawyerId);
  }

  public async deleteNotification(lawyerId: string, notificationId: string) {
    await this.ensureNotificationBelongsToLawyer(lawyerId, notificationId);

    await this.notificationRepository.deleteByIdForLawyer(
      lawyerId,
      notificationId,
    );

    return { id: notificationId };
  }
}