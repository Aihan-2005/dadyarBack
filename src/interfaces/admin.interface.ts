import type { z } from "zod";

import {
  AdminClientListQuerySchema,
  AdminLawyerListQuerySchema,
} from "../validators/admin.validator";

import type { UserRecord } from "./user.interface";

import type { LawyerRecord } from "./lawyer.interface";

export type AdminClientListOptions = z.output<
  typeof AdminClientListQuerySchema
>;

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
