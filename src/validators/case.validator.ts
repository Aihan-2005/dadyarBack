import { z } from "zod";
import { CASE_STATES, COURT_TYPES } from "../constants/case.constants";
import { Types } from "mongoose";
import { MESSAGES } from "../constants/messages.constants";
import { env } from "../config/env";
import { OptionalNationalIdSchema } from "./client.validator";
import { CasePaymentInputSchema } from "./casePayment.validator";
const LANGUAGE = env.LANGUAGE;

export const MongoIdSchema = z
  .string()
  .trim()
  .refine((value) => Types.ObjectId.isValid(value), {
    message: MESSAGES["invalidObjectId"][LANGUAGE],
  });

const RequiredString = z.string().trim().min(1);

const cleanOptionalString = (maxLength: number) =>
  z.preprocess((value) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    return value;
  }, z.string().trim().max(maxLength).optional());
const OptionalString = cleanOptionalString(2000);

const OptionalRoleSchema = cleanOptionalString(100);

const OptionalRepresentSchema = cleanOptionalString(200);

const normalizePersianDigits = (value: string): string =>
  value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));

const PhoneSchema = z.preprocess(
  (value: unknown) =>
    typeof value === "string" ? normalizePersianDigits(value) : value,
  RequiredString.regex(/^09\d{9}$/, {
    message: MESSAGES.invalidPhoneFormat[LANGUAGE],
  }),
);

const MoneySchema = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() !== "" ? Number(value) : value,

  z.number().int().min(0),
);
export const CaseStateSchema = z.enum(CASE_STATES);

export const CourtTypeSchema = z.enum(COURT_TYPES);

export const CourtSchema = z.object({
  type: CourtTypeSchema,

  province: RequiredString,

  city: RequiredString,

  branch: RequiredString,

  branchCode: OptionalString,
});

// export const ClientSchema = z.object({
//   fullName: RequiredString,
//
//   phone: RequiredString,
//
//   nationalId: OptionalString,
//
//   role: OptionalString,
// });

export const CaseClientSchema = z
  .object({
    clientId: MongoIdSchema,

    assignedAmount: MoneySchema,

    role: OptionalRoleSchema,

    represent: OptionalRepresentSchema,
  })
  .strict();

export const ManualCaseClientSchema = z
  .object({
    phone: PhoneSchema,

    assignedAmount: MoneySchema,

    fullName: RequiredString.max(200).optional(),

    nationalId: OptionalNationalIdSchema,

    role: OptionalRoleSchema,

    represent: OptionalRepresentSchema,

    payments: z.array(CasePaymentInputSchema).optional(),
  })
  .strict();

export const OpposingPartySchema = z.object({
  fullName: RequiredString,

  phone: OptionalString,

  nationalId: OptionalNationalIdSchema,

  description: OptionalString,
});

export const LawyerContactSchema = z.object({
  fullName: RequiredString,

  phone: RequiredString,

  barLicenseNumber: OptionalString,

  licenseExpiresAt: z.coerce.date().optional(),

  licensePlaceOfIssue: OptionalString,
});

export const RelatedPersonSchema = z.object({
  fullName: RequiredString,

  phone: RequiredString,

  description: OptionalString,
});

const CaseBodySchema = z
  .object({
    title: RequiredString,

    caseNumber: RequiredString,

    value: MoneySchema,

    state: CaseStateSchema.optional(),

    court: CourtSchema.optional(),

    clients: z.array(ManualCaseClientSchema).min(1, {
      message: MESSAGES.caseNeedClient[LANGUAGE],
    }),

    opposingParties: z.array(OpposingPartySchema).optional(),

    assistantLawyers: z.array(LawyerContactSchema).optional(),

    opposingLawyers: z.array(LawyerContactSchema).optional(),

    relatedPeople: z.array(RelatedPersonSchema).optional(),
  })
  .strict();

export const CreateCaseSchema = CaseBodySchema;

export const UpdateCaseSchema = CaseBodySchema.omit({ state: true })
  .partial()
  .superRefine((data, context) => {
    const hasValue = data.value !== undefined;

    const hasClients = data.clients !== undefined;

    if (hasValue !== hasClients) {
      context.addIssue({
        code: "custom",

        path: hasValue ? ["clients"] : ["value"],

        message: MESSAGES.valueAndClientsRequiredTogether[LANGUAGE],
      });
    }
  });

export const UpdateCaseStateSchema = z.object({
  state: CaseStateSchema,
});

export const UpdateCourtSchema = CourtSchema.partial();

// export const AddCaseClientSchema = ManualCaseClientSchema;

// export const UpdateCaseClientSchema = ManualCaseClientSchema.partial();

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

// export const ParamCaseAndClientIdSchema = z.object({
//   caseId: MongoIdSchema,
//   clientId: MongoIdSchema,
// });

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
