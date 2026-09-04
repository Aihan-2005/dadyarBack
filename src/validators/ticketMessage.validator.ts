import { z } from "zod";

import { MongoIdSchema, RequiredString } from "./commen.validator";

export const CreateTicketMessageSchema = z.object({
  message: RequiredString.max(5000),
});

export const ParamTicketMessageIdSchema = z.object({
  id: MongoIdSchema,

  messageId: MongoIdSchema,
});
