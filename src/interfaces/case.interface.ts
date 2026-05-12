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

export const CASE_STATES = [
  "PENDING",
  "IN_PROGRESS",
  "DONE",
  "ARCHIVED",
] as const;

export const COURT_TYPES = [
  "GENERAL_COURT",
  "REVOLUTIONARY_COURT",
  "CRIMINAL_COURT",
  "FAMILY_COURT",
  "JUVENILE_COURT",
] as const;

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
