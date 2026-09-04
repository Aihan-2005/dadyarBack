import { z } from "zod";
import { AdminUserListQuerySchema } from "../validators/admin.validator";

export type AdminUserListOptions = z.output<typeof AdminUserListQuerySchema>;
