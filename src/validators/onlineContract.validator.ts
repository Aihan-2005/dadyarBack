import {
  z,
} from "zod";

import {
  ONLINE_CONTRACT_PAYMENT_MODES,
  ONLINE_CONTRACT_STATUSES,
  ONLINE_CONTRACT_TEMPLATE_KEYS,
} from "../constants/onlineContract.constants";

import {
  MongoIdSchema,
} from "./common.validator";

const START_DATE_PATTERN =
  /^\d{4}\/(?:0[1-9]|1[0-2])\/(?:0[1-9]|[12]\d|3[01])$/;

const RequiredTrimmedString = (
  min: number,
  max: number,
  message: string,
) =>
  z
    .string()
    .trim()
    .min(
      min,
      message,
    )
    .max(
      max,
    );

const OptionalTrimmedString = (
  max: number,
) =>
  z
    .string()
    .trim()
    .max(
      max,
    )
    .optional()
    .transform(
      (
        value,
      ) =>
        value ||
        undefined,
    );

export const OnlineContractPaymentModeSchema =
  z.enum(
    ONLINE_CONTRACT_PAYMENT_MODES,
  );

export const OnlineContractStatusSchema =
  z.enum(
    Object.values(
      ONLINE_CONTRACT_STATUSES,
    ) as [
      (typeof ONLINE_CONTRACT_STATUSES)[keyof typeof ONLINE_CONTRACT_STATUSES],
      ...(typeof ONLINE_CONTRACT_STATUSES)[keyof typeof ONLINE_CONTRACT_STATUSES][],
    ],
  );

export const OnlineContractTemplateKeySchema =
  z.enum(
    ONLINE_CONTRACT_TEMPLATE_KEYS,
  );

const ContractCommercialFieldsSchema =
  z
    .object({
      subject:
        RequiredTrimmedString(
          5,
          180,
          "موضوع قرارداد را کامل‌تر وارد کنید",
        ),

      scope:
        RequiredTrimmedString(
          20,
          1600,
          "دامنه خدمات باید حداقل ۲۰ کاراکتر باشد",
        ),

      feeToman:
        z
          .number()
          .int()
          .positive()
          .max(
            Number.MAX_SAFE_INTEGER,
          ),

      paymentMode:
        OnlineContractPaymentModeSchema,

      paymentDetails:
        z
          .string()
          .trim()
          .max(
            1000,
          ),

      servicePeriod:
        RequiredTrimmedString(
          3,
          500,
          "مدت ارائه خدمات را مشخص کنید",
        ),

      additionalTerms:
        OptionalTrimmedString(
          3000,
        ),
    })
    .superRefine(
      (
        value,
        ctx,
      ) => {
        if (
          value.paymentMode !==
            "full" &&
          value.paymentDetails.length <
            5
        ) {
          ctx.addIssue({
            code:
              "custom",

            path: [
              "paymentDetails",
            ],

            message:
              "جزئیات پرداخت را تکمیل کنید",
          });
        }
      },
    );

export const CreateOnlineContractSchema =
  z
    .object({
      lawyerId:
        MongoIdSchema,

      templateKey:
        OnlineContractTemplateKeySchema,

      nationalId:
        z
          .string()
          .trim()
          .regex(
            /^\d{10}$/,
            "کد ملی باید دقیقاً ۱۰ رقم باشد",
          ),

      address:
        OptionalTrimmedString(
          500,
        ),

      subject:
        ContractCommercialFieldsSchema
          .shape
          .subject,

      scope:
        ContractCommercialFieldsSchema
          .shape
          .scope,

      feeToman:
        ContractCommercialFieldsSchema
          .shape
          .feeToman,

      paymentMode:
        ContractCommercialFieldsSchema
          .shape
          .paymentMode,

      paymentDetails:
        ContractCommercialFieldsSchema
          .shape
          .paymentDetails,

      startDate:
        z
          .string()
          .trim()
          .regex(
            START_DATE_PATTERN,
            "تاریخ شروع قرارداد معتبر نیست",
          ),

      servicePeriod:
        ContractCommercialFieldsSchema
          .shape
          .servicePeriod,

      additionalTerms:
        ContractCommercialFieldsSchema
          .shape
          .additionalTerms,
    })
    .strict()
    .superRefine(
      (
        value,
        ctx,
      ) => {
        if (
          value.paymentMode !==
            "full" &&
          value.paymentDetails.length <
            5
        ) {
          ctx.addIssue({
            code:
              "custom",

            path: [
              "paymentDetails",
            ],

            message:
              "جزئیات پرداخت را تکمیل کنید",
          });
        }
      },
    );

export const ReviewOnlineContractSchema =
  ContractCommercialFieldsSchema
    .strict();

export const RequestOnlineContractChangesSchema =
  z
    .object({
      feedback:
        RequiredTrimmedString(
          5,
          2000,
          "توضیح مورد نیاز برای اصلاح را کامل وارد کنید",
        ),
    })
    .strict();

export const RejectOnlineContractSchema =
  z
    .object({
      reason:
        RequiredTrimmedString(
          5,
          2000,
          "دلیل رد قرارداد را کامل وارد کنید",
        ),
    })
    .strict();

export const OnlineContractIdParamSchema =
  z
    .object({
      id:
        MongoIdSchema,
    })
    .strict();

export const OnlineContractListQuerySchema =
  z
    .object({
      search:
        z
          .string()
          .trim()
          .max(
            200,
          )
          .optional(),

      status:
        OnlineContractStatusSchema
          .optional(),

      page:
        z
          .coerce
          .number()
          .int()
          .min(
            1,
          )
          .default(
            1,
          ),

      limit:
        z
          .coerce
          .number()
          .int()
          .min(
            1,
          )
          .max(
            100,
          )
          .default(
            50,
          ),
    })
    .strict();
 