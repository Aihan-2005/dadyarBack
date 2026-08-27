import type { InferSchemaType } from "mongoose";

import type { z } from "zod";

import type { TicketMessageSender } from "../constants/ticket.constants";

import { TicketMessageSchema } from "../models/ticketMessage.model";

import { CreateTicketMessageSchema } from "../validators/ticketMessage.validator";

export type TicketMessage = InferSchemaType<typeof TicketMessageSchema> & {
  createdAt: Date;

  updatedAt: Date;
};

export type CreateTicketMessageInput = z.infer<
  typeof CreateTicketMessageSchema
>;

export type CreateTicketMessageData = CreateTicketMessageInput & {
  ticketId: string;

  senderId: string;

  senderType: TicketMessageSender;
};
