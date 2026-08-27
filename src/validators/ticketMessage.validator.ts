import { z } from "zod";

const RequiredString = z.string().trim().min(1);

export const CreateTicketMessageSchema = z.object({
  message: RequiredString.max(5000),
});
