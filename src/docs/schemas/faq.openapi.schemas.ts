import { z } from "zod";

import { openApiRegistry } from "../openapi.registry";

import {
  ApiErrorSchema,
  DateTimeResponseSchema,
  ObjectIdResponseSchema,
  PaginationSchema,
} from "./common.openapi";

// ========================================================
// FAQ
// ========================================================

export const FAQResponseSchema = openApiRegistry.register(
  "FAQResponse",

  z.object({
    _id: ObjectIdResponseSchema,

    question: z.string(),

    answer: z.string(),

    createdAt: DateTimeResponseSchema,

    updatedAt: DateTimeResponseSchema,
  }),
);

// ========================================================
// Single FAQ Response
// ========================================================

export const FAQSuccessSchema = openApiRegistry.register(
  "FAQSuccess",

  z.object({
    success: z.literal(true),

    data: FAQResponseSchema,
  }),
);

// ========================================================
// FAQ List Response
// ========================================================

export const FAQListSuccessSchema = openApiRegistry.register(
  "FAQListSuccess",

  z.object({
    success: z.literal(true),

    data: z.array(FAQResponseSchema),

    pagination: PaginationSchema,
  }),
);

export { ApiErrorSchema };
