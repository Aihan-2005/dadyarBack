import type { InferSchemaType } from "mongoose";

import type { z } from "zod";

import { TicketSchema } from "../models/ticket.model";

import { CreateTicketSchema } from "../validators/ticket.validator";

export type Ticket = InferSchemaType<typeof TicketSchema> & {
  createdAt: Date;

  updatedAt: Date;
};

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;

export type CreateTicketData = Omit<CreateTicketInput, "description">;
