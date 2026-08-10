import { z } from "zod";

import { openApiRegistry } from "../openapi.registry";

// ---------------- ObjectId ----------------

export const ObjectIdResponseSchema = openApiRegistry.register(
  "ObjectId",
  z.string().regex(/^[0-9a-fA-F]{24}$/),
);

// ---------------- Date / Time ----------------

export const DateTimeResponseSchema = openApiRegistry.register(
  "DateTime",
  z.iso.datetime(),
);

// ---------------- Pagination ----------------

export const PaginationSchema = openApiRegistry.register(
  "Pagination",
  z.object({
    page: z.number().int(),

    limit: z.number().int(),

    total: z.number().int(),

    totalPages: z.number().int(),
  }),
);

// ---------------- API Error ----------------

export const ApiErrorSchema = openApiRegistry.register(
  "ApiError",
  z.object({
    success: z.literal(false),

    code: z.string().optional(),

    message: z.string(),

    /*
     * HttpException may optionally
     * provide details.
     */
    details: z.any().optional(),

    /*
     * Zod validation errors.
     */
    issues: z
      .array(
        z.object({
          path: z.string(),

          message: z.string(),
        }),
      )
      .optional(),

    /*
     * Mongo duplicate errors may
     * identify the conflicting field.
     */
    field: z.string().optional(),
  }),
);
