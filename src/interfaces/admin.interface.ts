import type {
  z,
} from "zod";

import type {
  LawyerStatus,
} from "../constants/lawyer.constants";

import type {
  TicketStatus,
} from "../constants/ticket.constants";

import {
  AdminClientListQuerySchema,
  AdminCreateLawyerSchema,
  AdminLawyerListQuerySchema,
  AdminPublishClientLawyerSchema,
  AdminUpdateClientLawyerSchema,
} from "../validators/admin.validator";

import type {
  LawyerRecord,
} from "./lawyer.interface";

import type {
  Ticket,
} from "./ticket.interface";

import type {
  UserRecord,
  UserRole,
  UserStatus,
} from "./user.interface";

export type AdminCreateLawyerInput =
  z.output<
    typeof AdminCreateLawyerSchema
  >;

export type AdminPublishClientLawyerInput =
  z.output<
    typeof AdminPublishClientLawyerSchema
  >;

export type AdminUpdateClientLawyerInput =
  z.output<
    typeof AdminUpdateClientLawyerSchema
  >;

export type AdminClientListOptions =
  z.output<
    typeof AdminClientListQuerySchema
  >;

export type AdminLawyerListOptions =
  z.output<
    typeof AdminLawyerListQuerySchema
  >;

export interface AdminUserStatusCount {
  _id: {
    role: UserRole;
    status: UserStatus;
  };

  count: number;
}

export interface AdminLawyerStatusCount {
  _id:
    LawyerStatus;

  count: number;
}

export interface AdminTicketStatusCount {
  _id:
    TicketStatus;

  count: number;
}

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

  pendingVerification:
    number;

  active: number;

  suspended: number;

  rejected: number;
}

export interface AdminTicketStats {
  total: number;

  open: number;

  inProgress: number;

  waitingForLawyer:
    number;

  resolved: number;

  closed: number;
}

export type AdminLawyerListRecord =
  LawyerRecord & {
    user:
      UserRecord;
  };

export type AdminLawyerListAggregateResult = {
  items:
    AdminLawyerListRecord[];

  total: Array<{
    count: number;
  }>;
};

export type AdminTicketListRecord =
  Ticket & {
    messageCount:
      number;
  };
  