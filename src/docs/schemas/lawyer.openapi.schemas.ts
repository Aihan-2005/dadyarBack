import { z } from "zod";

import { openApiRegistry } from "../openapi.registry";

import {
  ApiErrorSchema,
  LawyerProfileResponseSchema,
  PublicLawyerSchema,
} from "./auth.openapi.schemas";

// ========================================================
// GET /lawyers/me
// ========================================================

export const LawyerMeSuccessSchema = openApiRegistry.register(
  "LawyerMeSuccess",

  z.object({
    success: z.literal(true),

    data: PublicLawyerSchema,
  }),
);

// ========================================================
// Lawyer Profile
// ========================================================

export const LawyerProfileSuccessSchema = openApiRegistry.register(
  "LawyerProfileSuccess",

  z.object({
    success: z.literal(true),

    data: z.object({
      profile: LawyerProfileResponseSchema,
    }),
  }),
);

export { ApiErrorSchema };
