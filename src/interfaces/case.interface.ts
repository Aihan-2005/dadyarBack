import { InferSchemaType, Types } from "mongoose";
import { z } from "zod";
import { CaseSchema } from "../models/case.model";
import {
  ClientSchema,
  CourtSchema,
  CreateCaseSchema,
  LawyerContactSchema,
  OpposingPartySchema,
  RelatedPersonSchema,
  UpdateCaseSchema,
} from "../validators/case.validator";

export {
  CASE_SATATE,
  COURT_TYPES,
} from "../constants/case.constants";

export interface FindCasesOptions {
  state?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export type Case = InferSchemaType<typeof CaseSchema> & {
  createdAt: Date;
  updatedAt: Date;
};

export type Court = z.infer<typeof CourtSchema>;

export type Client = z.infer<typeof ClientSchema> & {
  _id?: Types.ObjectId;
};

export type OpposingParty = z.infer<typeof OpposingPartySchema> & {
  _id?: Types.ObjectId;
};

export type LawyerContact = z.infer<typeof LawyerContactSchema> & {
  _id?: Types.ObjectId;
};

export type RelatedPerson = z.infer<typeof RelatedPersonSchema> & {
  _id?: Types.ObjectId;
};

export type CreateCaseInput = z.infer<typeof CreateCaseSchema> & {
  lawyerId: string | Types.ObjectId;
};

export type UpdateCaseInput = z.infer<typeof UpdateCaseSchema>;

export type CaseCreatePayload = Omit<CreateCaseInput, "lawyerId">;

export type SubDocumentWithId = {
  _id?: Types.ObjectId | string;
};
