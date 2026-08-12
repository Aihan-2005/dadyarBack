import {
  InferSchemaType,
  Types,
} from "mongoose";

import { z } from "zod";

import {
  CaseSchema,
} from "../models/case.model";

import {
  CaseClientSchema,
  CasePaymentTypeSchema,
  CaseRequestClientSchema,
  CaseStateSchema,
  CourtSchema,
  CreateCaseSchema,
  LawyerContactSchema,
  OpposingPartySchema,
  RelatedPersonSchema,
  UpdateCaseSchema,
} from "../validators/case.validator";

export {
  CASE_PAYMENT_TYPES,
  CASE_STATES,
  COURT_TYPES,
} from "../constants/case.constants";

export type CaseState =
  z.infer<
    typeof CaseStateSchema
  >;

export type CasePaymentType =
  z.infer<
    typeof CasePaymentTypeSchema
  >;

export type FindCasesOptions = {
  state?:
    CaseState;

  search?:
    string;

  page?:
    number;

  limit?:
    number;
};

export type Case =
  InferSchemaType<
    typeof CaseSchema
  > & {
    createdAt:
      Date;

    updatedAt:
      Date;
  };

export type Court =
  z.infer<
    typeof CourtSchema
  >;

export type OpposingParty =
  z.infer<
    typeof OpposingPartySchema
  > & {
    _id?:
      Types.ObjectId;
  };

export type LawyerContact =
  z.infer<
    typeof LawyerContactSchema
  > & {
    _id?:
      Types.ObjectId;
  };

export type RelatedPerson =
  z.infer<
    typeof RelatedPersonSchema
  > & {
    _id?:
      Types.ObjectId;
  };

export type SubDocumentWithId = {
  _id?:
    | Types.ObjectId
    | string;
};

export type CaseRequestClient =
  z.infer<
    typeof CaseRequestClientSchema
  >;

export type CaseClientInput =
  z.infer<
    typeof CaseClientSchema
  >;

export type CaseClient =
  Omit<
    CaseClientInput,
    "clientId"
  > & {
    clientId:
      Types.ObjectId;
  };

export type CaseCreatePayload =
  z.infer<
    typeof CreateCaseSchema
  >;

export type UpdateCaseInput =
  z.infer<
    typeof UpdateCaseSchema
  >;

export type CreateCaseInput =
  Omit<
    CaseCreatePayload,
    "clients" | "expenses"
  > & {
    lawyerId:
      string;

    clientAssignments:
      CaseClientInput[];
  };