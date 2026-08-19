import { InferSchemaType, Types } from "mongoose";
import { z } from "zod";
import { NotificationSchema } from "../models/notification.model";
import {
  CreateReminderSchema,
} from "../validators/notification.validator";

export {
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_STATUSES,
  NOTIFICATION_TARGETS,
} from "../constants/notification.constants";

export type Notification = InferSchemaType<typeof NotificationSchema> & {
  createdAt: Date;
  updatedAt: Date;
};

export type CreateReminderInput = z.infer<typeof CreateReminderSchema> & {
  lawyerId: string | Types.ObjectId;
  type: "reminder" | "client_reminder";
};

export type CreateReminderPayload = z.infer<typeof CreateReminderSchema>;