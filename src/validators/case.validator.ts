import { z } from "zod";
import { CASE_STATES, CaseSchema, COURT_TYPES } from "../models/case.model";
import { Types } from "mongoose";
import { MESSAGES } from "../constants/messages";
import { env } from "../config/env";

const LANGUAGE = env.LANGUAGE;
export const MongoIdSchema = z
  .string()
  .trim()
  .refine((value) => Types.ObjectId.isValid(value), {
    message: MESSAGES["invalidObjectId"][LANGUAGE],
  });

const RequiredString = z.string().trim().min(1);

const OptionalString = z.string().trim().optional();

export const CaseStateSchema = z.enum(CASE_STATES);

export const CourtTypeSchema = z.enum(COURT_TYPES);

export const CourtSchema = z.object({
  type: CourtTypeSchema,

  province: RequiredString,

  city: RequiredString,

  branch: RequiredString,

  branchCode: OptionalString,
});

export const ClientSchema = z.object({
  fullName: RequiredString,

  phone: RequiredString,

  nationalId: OptionalString,

  role: OptionalString,
});

export const OpposingPartySchema = z.object({
  fullName: RequiredString,

  phone: OptionalString,

  nationalId: OptionalString,

  description: OptionalString,
});

export const LawyerContactSchema = z.object({
  fullName: RequiredString,

  phone: RequiredString,

  barLicenseNumber: OptionalString,

  // will turn the string given to date object
  licenseExpiresAt: z.coerce.date().optional(),

  licensePlaceOfIssue: OptionalString,
});

export const RelatedPersonSchema = z.object({
  fullName: RequiredString,

  phone: RequiredString,

  description: OptionalString,
});

export const CreateCaseSchema = z.object({
  title: RequiredString,

  caseNumber: RequiredString,

  state: CaseStateSchema.optional(),

  court: CourtSchema,

  clients: z.array(ClientSchema).min(1, {
    message: MESSAGES["caseNeedClient"][LANGUAGE],
  }),

  opposingParties: z.array(OpposingPartySchema).optional(),

  assistantLawyers: z.array(LawyerContactSchema).optional(),

  opposingLawyers: z.array(LawyerContactSchema).optional(),

  relatedPeople: z.array(RelatedPersonSchema).optional(),
});
export const UpdateCaseSchema = CreateCaseSchema.partial();

export const UpdateCaseStateSchema = z.object({
  state: CaseStateSchema,
});

export const AddClientSchema = ClientSchema;

export const UpdateClientSchema = ClientSchema.partial();

export const AddOpposingPartySchema = OpposingPartySchema;

export const UpdateOpposingPartySchema = OpposingPartySchema.partial();

export const AddAssistantLawyerSchema = LawyerContactSchema;

export const UpdateAssistantLawyerSchema = LawyerContactSchema.partial();

export const AddOpposingLawyerSchema = LawyerContactSchema;

export const UpdateOpposingLawyerSchema = LawyerContactSchema.partial();

export const AddRelatedPersonSchema = RelatedPersonSchema;

export const UpdateRelatedPersonSchema = RelatedPersonSchema.partial();

export const ParamCaseIdSchema = z.object({
  caseId: MongoIdSchema,
});

export const ParamSubDocumentIdSchema = z.object({
  id: MongoIdSchema,
});

export const ParamCaseAndClientIdSchema = z.object({
  caseId: MongoIdSchema,
  clientId: MongoIdSchema,
});

export const ParamCaseAndOpposingPartyIdSchema = z.object({
  caseId: MongoIdSchema,
  opposingPartyId: MongoIdSchema,
});

export const ParamCaseAndAssistantLawyerIdSchema = z.object({
  caseId: MongoIdSchema,
  assistantLawyerId: MongoIdSchema,
});

export const ParamCaseAndOpposingLawyerIdSchema = z.object({
  caseId: MongoIdSchema,
  opposingLawyerId: MongoIdSchema,
});

export const ParamCaseAndRelatedPersonIdSchema = z.object({
  caseId: MongoIdSchema,
  relatedPersonId: MongoIdSchema,
});

export const ListCasesQuerySchema = z.object({
  state: CaseStateSchema.optional(),

  search: z.string().trim().optional(),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),
});
