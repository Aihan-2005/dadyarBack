import { z } from "zod";

import { TICKET_STATUSES, TICKET_TYPES } from "../constants/ticket.constants";

import { MongoIdSchema } from "./case.validator";

const RequiredString = z.string().trim().min(1);

export const TicketTypeSchema = z.enum(TICKET_TYPES);

export const CreateTicketSchema = z.object({
  title: RequiredString.max(200),

  description: RequiredString.max(5000),

  type: TicketTypeSchema.optional(),
});

export const ParamTicketIdSchema = z.object({
  id: MongoIdSchema,
});

export const TicketStatusSchema = z.enum(TICKET_STATUSES);

export const UpdateTicketStatusSchema = z.object({
  status: TicketStatusSchema,
});
