import { z } from "zod";

import { LAWYER_STATUSES } from "../constants/lawyer.constants";
import { MongoIdSchema } from "./common.validator";

export const AdminUserListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const AdminUserIdParamSchema = z
  .object({
    id: MongoIdSchema,
  })
  .strict();

export const AdminUpdateLawyerStatusSchema = z
  .object({
    status: z.enum(LAWYER_STATUSES),
  })
  .strict();
