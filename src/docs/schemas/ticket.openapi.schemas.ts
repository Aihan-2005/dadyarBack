import { z } from "zod";

import {
  TICKET_MESSAGE_SENDERS,
  TICKET_STATUSES,
  TICKET_TYPES,
} from "../../constants/ticket.constants";

import { openApiRegistry } from "../openapi.registry";

import {
  ApiErrorSchema,
  DateTimeResponseSchema,
  ObjectIdResponseSchema,
} from "./common.openapi";

// ========================================================
// Multipart Requests
// ========================================================

export const CreateTicketMultipartSchema = openApiRegistry.register(
  "CreateTicketMultipart",
  z.object({
    title: z.string().trim().min(1).max(200),

    description: z.string().trim().min(1).max(5000),

    type: z.enum(TICKET_TYPES).optional(),

    attachment: z
      .string()
      .openapi({
        format: "binary",
        description: "Optional attachment. Maximum size: 2 MB.",
      })
      .optional(),
  }),
);

export const CreateTicketMessageMultipartSchema = openApiRegistry.register(
  "CreateTicketMessageMultipart",
  z.object({
    message: z.string().trim().min(1).max(5000),

    attachment: z
      .string()
      .openapi({
        format: "binary",
        description: "Optional attachment. Maximum size: 2 MB.",
      })
      .optional(),
  }),
);

// ========================================================
// Ticket
// ========================================================

export const TicketResponseSchema = openApiRegistry.register(
  "TicketResponse",
  z.object({
    _id: ObjectIdResponseSchema,

    lawyerId: ObjectIdResponseSchema,

    title: z.string(),

    type: z.enum(TICKET_TYPES).optional(),

    status: z.enum(TICKET_STATUSES),

    createdAt: DateTimeResponseSchema,

    updatedAt: DateTimeResponseSchema,
  }),
);

export const TicketSuccessSchema = openApiRegistry.register(
  "TicketSuccess",
  z.object({
    success: z.literal(true),

    data: TicketResponseSchema,
  }),
);

export const TicketListSuccessSchema = openApiRegistry.register(
  "TicketListSuccess",
  z.object({
    success: z.literal(true),

    data: z.array(TicketResponseSchema),
  }),
);

// ========================================================
// Ticket Message
// ========================================================

export const TicketMessageResponseSchema = openApiRegistry.register(
  "TicketMessageResponse",
  z.object({
    _id: ObjectIdResponseSchema,

    ticketId: ObjectIdResponseSchema,

    senderId: ObjectIdResponseSchema,

    senderType: z.enum(TICKET_MESSAGE_SENDERS),

    message: z.string(),

    attachmentId: ObjectIdResponseSchema.optional(),

    createdAt: DateTimeResponseSchema,

    updatedAt: DateTimeResponseSchema,
  }),
);

export const TicketMessageSuccessSchema = openApiRegistry.register(
  "TicketMessageSuccess",
  z.object({
    success: z.literal(true),

    data: TicketMessageResponseSchema,
  }),
);

export const TicketMessageListSuccessSchema = openApiRegistry.register(
  "TicketMessageListSuccess",
  z.object({
    success: z.literal(true),

    data: z.array(TicketMessageResponseSchema),
  }),
);

// ========================================================
// Attachment
// ========================================================

export const TicketAttachmentUrlSuccessSchema = openApiRegistry.register(
  "TicketAttachmentUrlSuccess",
  z.object({
    success: z.literal(true),

    data: z.object({
      url: z.string().url(),
    }),
  }),
);

export { ApiErrorSchema };
