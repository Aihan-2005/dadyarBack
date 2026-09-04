import { z } from "zod";
import {
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_STATUSES,
  NOTIFICATION_TARGETS,
} from "../constants/notification.constants";
import {
  MongoIdSchema,
  OptionalString,
  RequiredString,
} from "./commen.validator";

export const NotificationPrioritySchema = z.enum(NOTIFICATION_PRIORITIES);

export const NotificationStatusSchema = z.enum(NOTIFICATION_STATUSES);

export const NotificationTargetSchema = z.enum(NOTIFICATION_TARGETS);

export const CreateReminderSchema = z.object({
  title: RequiredString,

  message: OptionalString,

  priority: NotificationPrioritySchema,

  target: NotificationTargetSchema,

  caseId: MongoIdSchema.optional(),

  caseName: OptionalString,
  clientId: OptionalString,

  clientName: OptionalString,

  scheduledFor: z.coerce.date().optional(),
});

export const ParamNotificationIdSchema = z.object({
  id: MongoIdSchema,
});

