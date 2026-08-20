import {
  Types,
} from "mongoose";

import {
  z,
} from "zod";

import {
  CASE_PAYMENT_TYPES,
  CASE_STATES,
  COURT_TYPES,
} from "../constants/case.constants";

import {
  MESSAGES,
} from "../constants/messages.constants";

import {
  env,
} from "../config/env";

import {
  OptionalClientIdentitySchema,
  OptionalNationalIdSchema,
} from "./client.validator";

import {
  CasePaymentInputSchema,
} from "./casePayment.validator";

import {
  CaseExpenseInputSchema,
} from "./caseExpense.validator";

const LANGUAGE =
  env.LANGUAGE;


export const MongoIdSchema =
  z
    .string()
    .trim()
    .refine(
      (
        value
      ) =>
        Types.ObjectId.isValid(
          value
        ),
      {
        message:
          MESSAGES
            .invalidObjectId[
            LANGUAGE
          ],
      }
    );



const RequiredString =
  z
    .string()
    .trim()
    .min(1);

const cleanOptionalString =
  (
    maxLength:
      number
  ) =>
    z.preprocess(
      (
        value
      ) => {
        if (
          value ===
            undefined ||
          value ===
            null
        ) {
          return undefined;
        }

        if (
          typeof value ===
            "string" &&
          value.trim() ===
            ""
        ) {
          return undefined;
        }

        return value;
      },

      z
        .string()
        .trim()
        .max(
          maxLength
        )
        .optional()
    );

const OptionalString =
  cleanOptionalString(
    2000
  );

const LongOptionalString =
  cleanOptionalString(
    5000
  );

const OptionalRoleSchema =
  cleanOptionalString(
    100
  );

const OptionalRepresentSchema =
  cleanOptionalString(
    200
  );

const OptionalIdentityDocumentSchema =
  z.preprocess(
    (value) => {
      if (
        value === undefined ||
        value === null
      ) {
        return undefined;
      }

      if (typeof value !== "string") {
        return value;
      }

      const normalized =
        normalizePersianDigits(
          value.trim()
        );

      return normalized === ""
        ? undefined
        : normalized;
    },

    z
      .string()
      .regex(/^\d{1,20}$/)
      .optional()
  );


const OptionalDateSchema =
  z.preprocess(
    (
      value
    ) => {
      if (
        value ===
          undefined ||
        value ===
          null ||
        value ===
          ""
      ) {
        return undefined;
      }

      return value;
    },

    z.coerce
      .date()
      .optional()
  );



const normalizePersianDigits =
  (
    value:
      string
  ): string =>
    value
      .replace(
        /[۰-۹]/g,
        (
          digit
        ) =>
          String(
            "۰۱۲۳۴۵۶۷۸۹"
              .indexOf(
                digit
              )
          )
      )
      .replace(
        /[٠-٩]/g,
        (
          digit
        ) =>
          String(
            "٠١٢٣٤٥٦٧٨٩"
              .indexOf(
                digit
              )
          )
      );


const PhoneSchema =
  z.preprocess(
    (
      value:
        unknown
    ) =>
      typeof value ===
      "string"
        ? normalizePersianDigits(
            value.trim()
          )
        : value,

    RequiredString
      .regex(
        /^09\d{9}$/,
        {
          message:
            MESSAGES
              .invalidPhoneFormat[
              LANGUAGE
            ],
        }
      )
  );



const MoneySchema =
  z.preprocess(
    (
      value
    ) => {
      if (
        typeof value ===
          "string" &&
        value.trim() !==
          ""
      ) {
        return Number(
          normalizePersianDigits(
            value.trim()
          )
            .replace(
              /[٬,\s]/g,
              ""
            )
            .replace(
              /ریال|تومان|ت/g,
              ""
            )
        );
      }

      return value;
    },

    z
      .number()
      .int()
      .min(0)
  );



export const CaseStateSchema =
  z.enum(
    CASE_STATES
  );

export const CasePaymentTypeSchema =
  z.enum(
    CASE_PAYMENT_TYPES
  );

export const CourtTypeSchema =
  z.enum(
    COURT_TYPES
  );


export const CourtSchema =
  z
    .object({
      type:
        CourtTypeSchema,

      province:
        RequiredString,

      city:
        RequiredString,

      branch:
        RequiredString,

      branchCode:
        OptionalString,

      archiveNumberBranch:
        OptionalString,
    })
    .strict();



export const BranchHistorySchema =
  z
    .object({
      province:
        OptionalString,

      city:
        OptionalString,

      branchNumber:
        OptionalString,

      archiveNumberBranch:
        OptionalString,

      date:
        OptionalDateSchema,

      isActive:
        z.boolean(),
    })
    .strict();



export const CaseClientSchema =
  z
    .object({
      clientId:
        MongoIdSchema,

      assignedAmount:
        MoneySchema
          .optional()
          .default(0),

      birthDate:
        OptionalDateSchema,

      role:
        OptionalRoleSchema,

      represent:
        OptionalRepresentSchema,
    })
    .strict();



export const ExistingCaseClientSchema =
  z
    .object({
      clientId:
        MongoIdSchema,

      assignedAmount:
        MoneySchema
          .optional()
          .default(0),

      birthDate:
        OptionalDateSchema,

      role:
        OptionalRoleSchema,

      represent:
        OptionalRepresentSchema,

      payments:
        z
          .array(
            CasePaymentInputSchema
          )
          .optional(),
    })
    .strict();


export const ManualCaseClientSchema =
  z
    .object({
      phone:
        PhoneSchema,

      assignedAmount:
        MoneySchema
          .optional()
          .default(0),

      fullName:
        RequiredString
          .max(200)
          .optional(),

      nationalId:
        OptionalClientIdentitySchema,

      birthDate:
        OptionalDateSchema,

      role:
        OptionalRoleSchema,

      represent:
        OptionalRepresentSchema,

      payments:
        z
          .array(
            CasePaymentInputSchema
          )
          .optional(),
    })
    .strict();



export const CaseRequestClientSchema =
  z.union([
    ExistingCaseClientSchema,
    ManualCaseClientSchema,
  ]);


export const OpposingPartySchema =
  z
    .object({
      fullName:
        RequiredString,

      phone:
        OptionalString,

      nationalId:
        OptionalIdentityDocumentSchema,

      role:
        OptionalRoleSchema,

      birthDate:
        OptionalDateSchema,

      description:
        OptionalString,
    })
    .strict();



export const LawyerContactSchema =
  z
    .object({
      fullName:
        RequiredString,

      phone:
        RequiredString,

      nationalId:
        OptionalNationalIdSchema,

      birthDate:
        OptionalDateSchema,

      barLicenseNumber:
        OptionalString,

      licenseExpiresAt:
        OptionalDateSchema,

      licensePlaceOfIssue:
        OptionalString,
    })
    .strict();



export const RelatedPersonSchema =
  z
    .object({
      fullName:
        RequiredString,

      phone:
        RequiredString,

      nationalId:
        OptionalNationalIdSchema,

      birthDate:
        OptionalDateSchema,

      role:
        OptionalRoleSchema,

      description:
        OptionalString,
    })
    .strict();


const CaseBodySchema =
  z
    .object({
      

      title:
        RequiredString,

      caseNumber:
        RequiredString,

      archiveNumberOffice:
        OptionalString,

      value:
        MoneySchema
          .optional()
          .default(0),

      state:
        CaseStateSchema
          .optional(),

      description:
        LongOptionalString,

     

      paymentType:
        CasePaymentTypeSchema
          .optional(),

      nonCashDescription:
        OptionalString,

      estimatedPrice:
        MoneySchema
          .optional(),

      court:
        CourtSchema
          .optional(),

      branchHistory:
        z
          .array(
            BranchHistorySchema
          )
          .optional(),


      clients:
        z
          .array(
            CaseRequestClientSchema
          )
          .min(
            1,
            {
              message:
                MESSAGES
                  .caseNeedClient[
                  LANGUAGE
                ],
            }
          ),

      

      expenses:
        z
          .array(
            CaseExpenseInputSchema
          )
          .optional(),

      

      opposingParties:
        z
          .array(
            OpposingPartySchema
          )
          .optional(),

      assistantLawyers:
        z
          .array(
            LawyerContactSchema
          )
          .optional(),

      opposingLawyers:
        z
          .array(
            LawyerContactSchema
          )
          .optional(),

      relatedPeople:
        z
          .array(
            RelatedPersonSchema
          )
          .optional(),
    })
    .strict();



export const CreateCaseSchema =
  CaseBodySchema;

export const UpdateCaseSchema =
  CreateCaseSchema
    .omit({
      state:
        true,
    })
    .partial()
    .superRefine(
      (
        data,
        context
      ) => {
        if (
          Object.keys(
            data
          ).length ===
          0
        ) {
          context.addIssue({
            code:
              "custom",

            message:
              MESSAGES
                .noCaseFieldFound[
                LANGUAGE
              ],
          });
        }
      }
    );



export const UpdateCaseStateSchema =
  z
    .object({
      state:
        CaseStateSchema,
    })
    .strict();



export const UpdateCourtSchema =
  CourtSchema
    .partial();


export const AddOpposingPartySchema =
  OpposingPartySchema;

export const UpdateOpposingPartySchema =
  OpposingPartySchema
    .partial();



export const AddAssistantLawyerSchema =
  LawyerContactSchema;

export const UpdateAssistantLawyerSchema =
  LawyerContactSchema
    .partial();


export const AddOpposingLawyerSchema =
  LawyerContactSchema;

export const UpdateOpposingLawyerSchema =
  LawyerContactSchema
    .partial();



export const AddRelatedPersonSchema =
  RelatedPersonSchema;

export const UpdateRelatedPersonSchema =
  RelatedPersonSchema
    .partial();


export const ParamCaseIdSchema =
  z
    .object({
      caseId:
        MongoIdSchema,
    })
    .strict();


export const ParamSubDocumentIdSchema =
  z
    .object({
      id:
        MongoIdSchema,
    })
    .strict();



export const ParamCaseAndOpposingPartyIdSchema =
  z
    .object({
      caseId:
        MongoIdSchema,

      opposingPartyId:
        MongoIdSchema,
    })
    .strict();


export const ParamCaseAndAssistantLawyerIdSchema =
  z
    .object({
      caseId:
        MongoIdSchema,

      assistantLawyerId:
        MongoIdSchema,
    })
    .strict();


export const ParamCaseAndOpposingLawyerIdSchema =
  z
    .object({
      caseId:
        MongoIdSchema,

      opposingLawyerId:
        MongoIdSchema,
    })
    .strict();



export const ParamCaseAndRelatedPersonIdSchema =
  z
    .object({
      caseId:
        MongoIdSchema,

      relatedPersonId:
        MongoIdSchema,
    })
    .strict();



export const ListCasesQuerySchema =
  z
    .object({
      state:
        CaseStateSchema
          .optional(),

      search:
        z
          .string()
          .trim()
          .max(200)
          .optional(),

      page:
        z.coerce
          .number()
          .int()
          .min(1)
          .default(1),

      limit:
        z.coerce
          .number()
          .int()
          .min(1)
          .max(100)
          .default(20),
    })
    .strict();