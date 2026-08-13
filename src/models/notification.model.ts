import { model, Schema } from "mongoose";
import {
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_STATUSES,
  NOTIFICATION_TARGETS,
  NOTIFICATION_TYPES,
} from "../constants/notification.constants";

export const NotificationSchema = new Schema(
  {
    lawyerId: {
      type: Schema.Types.ObjectId,
      ref: "Lawyer",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      default: "reminder",
    },

    priority: {
      type: String,
      enum: NOTIFICATION_PRIORITIES,
      default: "medium",
    },

    status: {
      type: String,
      enum: NOTIFICATION_STATUSES,
      default: "unread",
      index: true,
    },

    target: {
      type: String,
      enum: NOTIFICATION_TARGETS,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      trim: true,
    },

    caseId: {
      type: Schema.Types.ObjectId,
      ref: "Case",
    },

    caseName: {
      type: String,
      trim: true,
    },

     clientId: {
      type: String,
      trim: true,
    },

    clientName: {
      type: String,
      trim: true,
    },

    scheduledFor: {
      type: Date,
    },

    readAt: {
      type: Date,
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

NotificationSchema.index({ lawyerId: 1, status: 1, createdAt: -1 });

export const NotificationModel = model("Notification", NotificationSchema);