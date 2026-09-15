import {
  z,
} from "zod";

import {
  ConsultationType,
} from "../constants/consultationBooking.constants";

import {
  LAWYER_AVAILABILITY_MAX_DURATION_MINUTES,
  LAWYER_AVAILABILITY_MIN_DURATION_MINUTES,
} from "../constants/lawyerAvailability.constants";

import {
  MongoIdSchema,
} from "./common.validator";


export const LawyerAvailabilityConsultationTypeSchema =
  z.enum([
    ConsultationType.ONLINE,
    ConsultationType.PHONE,
    ConsultationType.IN_PERSON,
  ]);


const ConsultationTypesSchema =
  z
    .array(
      LawyerAvailabilityConsultationTypeSchema,
    )
    .min(
      1,

      "حداقل یک نوع مشاوره را انتخاب کنید",
    )
    .max(
      3,
    )
    .refine(
      (
        values,
      ) =>
        new Set(
          values,
        ).size ===
        values.length,

      {
        message:
          "نوع مشاوره تکراری مجاز نیست",
      },
    );


function validateTimeRange(
  value: {
    startsAt:
      Date;

    endsAt:
      Date;
  },

  context:
    z.RefinementCtx,
): void {
  const start =
    value.startsAt.getTime();

  const end =
    value.endsAt.getTime();


  if (
    end <=
    start
  ) {
    context.addIssue({
      code:
        "custom",

      path: [
        "endsAt",
      ],

      message:
        "زمان پایان باید بعد از زمان شروع باشد",
    });

    return;
  }


  const durationMinutes =
    (
      end -
      start
    ) /
    60_000;


  if (
    durationMinutes <
    LAWYER_AVAILABILITY_MIN_DURATION_MINUTES
  ) {
    context.addIssue({
      code:
        "custom",

      path: [
        "endsAt",
      ],

      message:
        `مدت مشاوره نمی‌تواند کمتر از ${LAWYER_AVAILABILITY_MIN_DURATION_MINUTES} دقیقه باشد`,
    });
  }


  if (
    durationMinutes >
    LAWYER_AVAILABILITY_MAX_DURATION_MINUTES
  ) {
    context.addIssue({
      code:
        "custom",

      path: [
        "endsAt",
      ],

      message:
        `مدت مشاوره نمی‌تواند بیشتر از ${LAWYER_AVAILABILITY_MAX_DURATION_MINUTES} دقیقه باشد`,
    });
  }
}


export const CreateLawyerAvailabilitySchema =
  z
    .object({
      startsAt:
        z.coerce.date(),

      endsAt:
        z.coerce.date(),

      consultationTypes:
        ConsultationTypesSchema,

      note:
        z
          .string()
          .trim()
          .max(
            1000,
          )
          .optional(),

      isActive:
        z
          .boolean()
          .optional()
          .default(
            true,
          ),
    })
    .strict()
    .superRefine(
      validateTimeRange,
    );


export const UpdateLawyerAvailabilitySchema =
  z
    .object({
      startsAt:
        z
          .coerce
          .date()
          .optional(),

      endsAt:
        z
          .coerce
          .date()
          .optional(),

      consultationTypes:
        ConsultationTypesSchema
          .optional(),

      note:
        z
          .string()
          .trim()
          .max(
            1000,
          )
          .optional(),

      isActive:
        z
          .boolean()
          .optional(),
    })
    .strict()
    .refine(
      (
        value,
      ) =>
        Object.keys(
          value,
        ).length >
        0,

      {
        message:
          "حداقل یک مقدار برای ویرایش لازم است",
      },
    );


export const LawyerAvailabilityIdParamSchema =
  z
    .object({
      id:
        MongoIdSchema,
    })
    .strict();


export const LawyerAvailabilityClientParamSchema =
  z
    .object({
      lawyerId:
        MongoIdSchema,
    })
    .strict();


export const LawyerAvailabilityListQuerySchema =
  z
    .object({
      from:
        z
          .coerce
          .date()
          .optional(),

      to:
        z
          .coerce
          .date()
          .optional(),

      type:
        LawyerAvailabilityConsultationTypeSchema
          .optional(),

      includeInactive:
        z
          .enum([
            "true",
            "false",
          ])
          .transform(
            (
              value,
            ) =>
              value ===
              "true",
          )
          .optional()
          .default(
            false,
          ),
    })
    .strict()
    .superRefine(
      (
        value,
        context,
      ) => {
        if (
          value.from &&
          value.to &&
          value.to.getTime() <=
            value.from.getTime()
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "to",
            ],

            message:
              "بازه پایان باید بعد از شروع باشد",
          });
        }
      },
    );