import {
  z,
} from "zod";

import {
  CLIENT_LAWYER_INQUIRY_STATUSES,
} from "../constants/clientLawyerInquiry.constants";

import {
  MongoIdSchema,
  RequiredString,
} from "./common.validator";


export const ClientLawyerInquiryStatusSchema =
  z.enum(
    CLIENT_LAWYER_INQUIRY_STATUSES,
  );


export const CreateClientLawyerInquirySchema =
  z
    .object({
      lawyerId:
        MongoIdSchema,

      subject:
        RequiredString.max(
          200,
        ),

      description:
        RequiredString.max(
          5000,
        ),
    })
    .strict();


export const ClientLawyerInquiryIdParamSchema =
  z
    .object({
      id:
        MongoIdSchema,
    })
    .strict();


export const ClientLawyerInquiryListQuerySchema =
  z
    .object({
      status:
        ClientLawyerInquiryStatusSchema
          .optional(),

      search:
        z
          .string()
          .trim()
          .max(200)
          .optional(),

      page:
        z
          .coerce
          .number()
          .int()
          .min(1)
          .default(1),

      limit:
        z
          .coerce
          .number()
          .int()
          .min(1)
          .max(100)
          .default(20),
    })
    .strict();


export const LawyerInquiryDecisionSchema =
  z
    .object({
      status:
        z.enum([
          "IN_REVIEW",
          "ACCEPTED",
          "REJECTED",
          "CLOSED",
        ]),

      response:
        z
          .string()
          .trim()
          .max(5000)
          .optional(),
    })
    .strict()
    .superRefine(
      (
        value,
        context,
      ) => {
        if (
          (
            value.status ===
              "ACCEPTED" ||
            value.status ===
              "REJECTED"
          ) &&
          !value.response?.trim()
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "response",
            ],

            message:
              "برای پذیرش یا رد درخواست، پاسخ وکیل الزامی است",
          });
        }
      },
    );