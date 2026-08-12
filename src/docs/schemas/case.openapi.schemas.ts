import {
  z,
} from "zod";

import {
  openApiRegistry,
} from "../openapi.registry";

import {
  CasePaymentTypeSchema,
  CaseStateSchema,
  CourtSchema,
} from "../../validators/case.validator";

import {
  ApiErrorSchema,
  DateTimeResponseSchema,
  ObjectIdResponseSchema,
  PaginationSchema,
} from "./common.openapi";



export const CasePaymentResponseSchema =
  openApiRegistry.register(
    "CasePaymentResponse",

    z.object({
      paymentId:
        ObjectIdResponseSchema,

      method:
        z.enum([
          "CASH",
          "NON_CASH",
        ]),

      amount:
        z.number(),

      description:
        z
          .string()
          .optional(),

      dueDate:
        DateTimeResponseSchema
          .optional(),

      isPaid:
        z.boolean(),

      createdAt:
        DateTimeResponseSchema
          .optional(),

      updatedAt:
        DateTimeResponseSchema
          .optional(),
    })
  );



export const CaseExpenseResponseSchema =
  openApiRegistry.register(
    "CaseExpenseResponse",

    z.object({
      expenseId:
        ObjectIdResponseSchema,

      title:
        z.string(),

      amount:
        z.number(),

      description:
        z
          .string()
          .optional(),

      expenseDate:
        DateTimeResponseSchema
          .optional(),

      isPaid:
        z.boolean(),

      createdAt:
        DateTimeResponseSchema
          .optional(),

      updatedAt:
        DateTimeResponseSchema
          .optional(),
    })
  );



export const CaseClientResponseSchema =
  openApiRegistry.register(
    "CaseClientResponse",

    z.object({
      clientId:
        ObjectIdResponseSchema,

      fullName:
        z.string(),

      phone:
        z.string(),

      nationalId:
        z
          .string()
          .optional(),

      assignedAmount:
        z.number(),

      role:
        z
          .string()
          .optional(),

      represent:
        z
          .string()
          .optional(),

      payments:
        z.array(
          CasePaymentResponseSchema
        ),
    })
  );


export const CaseBranchHistoryResponseSchema =
  openApiRegistry.register(
    "CaseBranchHistoryResponse",

    z.object({
      province:
        z
          .string()
          .optional(),

      city:
        z
          .string()
          .optional(),

      branchNumber:
        z
          .string()
          .optional(),

      archiveNumberBranch:
        z
          .string()
          .optional(),

      date:
        DateTimeResponseSchema
          .optional(),

      isActive:
        z.boolean(),
    })
  );



export const OpposingPartyResponseSchema =
  openApiRegistry.register(
    "OpposingPartyResponse",

    z.object({
      _id:
        ObjectIdResponseSchema,

      fullName:
        z.string(),

      phone:
        z
          .string()
          .optional(),

      nationalId:
        z
          .string()
          .optional(),

      role:
        z
          .string()
          .optional(),

      birthDate:
        DateTimeResponseSchema
          .optional(),

      description:
        z
          .string()
          .optional(),
    })
  );


export const LawyerContactResponseSchema =
  openApiRegistry.register(
    "LawyerContactResponse",

    z.object({
      _id:
        ObjectIdResponseSchema,

      fullName:
        z.string(),

      phone:
        z.string(),

      barLicenseNumber:
        z
          .string()
          .optional(),

      licenseExpiresAt:
        DateTimeResponseSchema
          .optional(),

      licensePlaceOfIssue:
        z
          .string()
          .optional(),
    })
  );



export const RelatedPersonResponseSchema =
  openApiRegistry.register(
    "RelatedPersonResponse",

    z.object({
      _id:
        ObjectIdResponseSchema,

      fullName:
        z.string(),

      phone:
        z.string(),

      nationalId:
        z
          .string()
          .optional(),

      role:
        z
          .string()
          .optional(),

      description:
        z
          .string()
          .optional(),
    })
  );



export const CaseDetailsSchema =
  openApiRegistry.register(
    "CaseDetails",

    z.object({
      _id:
        ObjectIdResponseSchema,

      title:
        z.string(),

      caseNumber:
        z.string(),

      state:
        CaseStateSchema,

      description:
        z
          .string()
          .optional(),

      paymentType:
        CasePaymentTypeSchema
          .optional(),

      nonCashDescription:
        z
          .string()
          .optional(),

      court:
        CourtSchema
          .optional(),

      branchHistory:
        z
          .array(
            CaseBranchHistoryResponseSchema
          )
          .optional(),

      value:
        z.number(),

      clients:
        z.array(
          CaseClientResponseSchema
        ),

      expenses:
        z.array(
          CaseExpenseResponseSchema
        ),

      opposingParties:
        z.array(
          OpposingPartyResponseSchema
        ),

      assistantLawyers:
        z.array(
          LawyerContactResponseSchema
        ),

      opposingLawyers:
        z.array(
          LawyerContactResponseSchema
        ),

      relatedPeople:
        z.array(
          RelatedPersonResponseSchema
        ),

      createdAt:
        DateTimeResponseSchema,

      updatedAt:
        DateTimeResponseSchema,

      __v:
        z
          .number()
          .int()
          .optional(),
    })
  );



export const CaseDetailsSuccessSchema =
  openApiRegistry.register(
    "CaseDetailsSuccess",

    z.object({
      success:
        z.literal(
          true
        ),

      data:
        CaseDetailsSchema,
    })
  );



export const CaseListItemSchema =
  CaseDetailsSchema;

export const CaseListSuccessSchema =
  openApiRegistry.register(
    "CaseListSuccess",

    z.object({
      success:
        z.literal(
          true
        ),

      data:
        z.array(
          CaseListItemSchema
        ),

      pagination:
        PaginationSchema,
    })
  );



export const CaseDeleteSuccessSchema =
  openApiRegistry.register(
    "CaseDeleteSuccess",

    z.object({
      success:
        z.literal(
          true
        ),

      data:
        z.object({
          caseId:
            ObjectIdResponseSchema,

          deleted:
            z.literal(
              true
            ),
        }),
    })
  );



export {
  ApiErrorSchema,
};