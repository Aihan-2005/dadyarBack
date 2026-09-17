import type {
  InferSchemaType,
  Types,
} from "mongoose";

import type {
  z,
} from "zod";

import type {
  OnlineContractActor,
  OnlineContractAuditAction,
  OnlineContractPaymentMode,
  OnlineContractStatus,
  OnlineContractTemplateKey,
  OnlineContractVersionAuthor,
} from "../constants/onlineContract.constants";

import type {
  OnlineContractTemplateSnapshot,
} from "../constants/onlineContractTemplates.constants";

import {
  OnlineContractSchema,
} from "../models/onlineContract.model";

import {
  CreateOnlineContractSchema,
  OnlineContractListQuerySchema,
  RejectOnlineContractSchema,
  RequestOnlineContractChangesSchema,
  ReviewOnlineContractSchema,
} from "../validators/onlineContract.validator";

export type OnlineContract =
  InferSchemaType<
    typeof OnlineContractSchema
  >;

export type OnlineContractRecord =
  OnlineContract & {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
  };

export interface OnlineContractClientPartySnapshot {
  fullName: string;
  phone: string;
  nationalId: string;
  address: string;
}

export interface OnlineContractLawyerPartySnapshot {
  id: string;
  fullName: string;
  specialization: string;
  licenseNumber: string;
  address: string;
}

export interface OnlineContractDraftData {
  templateKey: OnlineContractTemplateKey;
  client: OnlineContractClientPartySnapshot;
  lawyer: OnlineContractLawyerPartySnapshot;
  subject: string;
  scope: string;
  feeToman: number;
  paymentMode: OnlineContractPaymentMode;
  paymentDetails: string;
  startDate: string;
  servicePeriod: string;
  additionalTerms: string;
}

export interface OnlineContractVersionData {
  version: number;
  draft: OnlineContractDraftData;
  createdBy: OnlineContractVersionAuthor;
  createdAt: Date;
  summary: string;
}

export interface OnlineContractAuditEventData {
  id: string;
  action: OnlineContractAuditAction;
  actor: OnlineContractActor;
  label: string;
  createdAt: Date;
}

export interface CreatePersistedOnlineContractInput {
  clientId: string;
  lawyerId: string;
  reference: string;
  status: OnlineContractStatus;
  templateSnapshot: OnlineContractTemplateSnapshot;
  draft: OnlineContractDraftData;
  version: number;
  versions: OnlineContractVersionData[];
  auditTrail: OnlineContractAuditEventData[];
}

export type CreateOnlineContractInput =
  z.output<
    typeof CreateOnlineContractSchema
  >;

export type ReviewOnlineContractInput =
  z.output<
    typeof ReviewOnlineContractSchema
  >;

export type RequestOnlineContractChangesInput =
  z.output<
    typeof RequestOnlineContractChangesSchema
  >;

export type RejectOnlineContractInput =
  z.output<
    typeof RejectOnlineContractSchema
  >;

export type OnlineContractListOptions =
  z.output<
    typeof OnlineContractListQuerySchema
  >;