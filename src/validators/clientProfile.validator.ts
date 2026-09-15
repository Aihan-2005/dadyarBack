import { z } from "zod";

export const ClientFullNameSchema = z.string().trim().min(3).max(200);

export const UpdateClientProfileSchema = z
  .object({
    fullName: ClientFullNameSchema,
  })
  .strict();