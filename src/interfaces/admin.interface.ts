import type { z } from "zod";

import {
  AdminLawyerListQuerySchema,
  AdminUserListQuerySchema,
} from "../validators/admin.validator";
import type { UserRecord } from "./user.interface";
import type { LawyerRecord } from "./lawyer.interface";

export type AdminUserListOptions = z.output<typeof AdminUserListQuerySchema>;

export type AdminLawyerListOptions = z.output<
  typeof AdminLawyerListQuerySchema
>;

export type AdminLawyerListRecord = LawyerRecord & {
  user: UserRecord;
};

export type AdminLawyerListAggregateResult = {
  items: AdminLawyerListRecord[];

  total: Array<{
    count: number;
  }>;
};
