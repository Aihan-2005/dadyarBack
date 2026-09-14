import type {
  z,
} from "zod";

import type {
  LawyerRecord,
} from "./lawyer.interface";

import type {
  UserRecord,
} from "./user.interface";

import {
  LawyerDirectoryListQuerySchema,
} from "../validators/lawyer.validator";

export type LawyerDirectoryListOptions =
  z.output<
    typeof LawyerDirectoryListQuerySchema
  >;

export type LawyerDirectoryAggregateRecord =
  LawyerRecord & {
    user:
      UserRecord;
  };

export interface LawyerDirectoryAggregateResult {
  items:
    LawyerDirectoryAggregateRecord[];

  total: Array<{
    count: number;
  }>;
}