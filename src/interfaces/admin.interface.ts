import type { z } from "zod";

import {
  AdminClientListQuerySchema,
  AdminLawyerListQuerySchema,
} from "../validators/admin.validator";

import type { UserRecord } from "./user.interface";

import type { LawyerRecord } from "./lawyer.interface";
import type { LawyerStatus } from "../constants/lawyer.constants";
import type { TicketStatus } from "../constants/ticket.constants";

import type { UserRole, UserStatus } from "./user.interface";

// ---------------- Dashboard aggregation rows ----------------

export interface AdminUserStatusCount {
  _id: {
    role: UserRole;
    status: UserStatus;
  };

  count: number;
}

export interface AdminLawyerStatusCount {
  _id: LawyerStatus;
  count: number;
}

export interface AdminTicketStatusCount {
  _id: TicketStatus;
  count: number;
}

// ---------------- Dashboard repository results ----------------

export interface AdminAccountStats {
  clients: {
    total: number;
    active: number;
    suspended: number;
  };

  lawyers: {
    total: number;
    active: number;
    suspended: number;
  };
}

export interface AdminLawyerStats {
  total: number;

  pendingVerification: number;
  active: number;
  suspended: number;
  rejected: number;
}

export interface AdminTicketStats {
  total: number;

  open: number;
  inProgress: number;
  waitingForLawyer: number;
  resolved: number;
  closed: number;
}

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
