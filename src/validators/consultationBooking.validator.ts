import {
  z,
} from "zod";

import {
  ConsultationBookingStatus,
  ConsultationType,
} from "../constants/consultationBooking.constants";

import {
  MongoIdSchema,
} from "./common.validator";


export const ConsultationTypeSchema =
  z.enum([
    ConsultationType.ONLINE,
    ConsultationType.PHONE,
    ConsultationType.IN_PERSON,
  ]);


export const ConsultationBookingStatusSchema =
  z.enum([
    ConsultationBookingStatus.PENDING,
    ConsultationBookingStatus.CONFIRMED,
    ConsultationBookingStatus.REJECTED,
    ConsultationBookingStatus.COMPLETED,
    ConsultationBookingStatus.CANCELLED,
  ]);


/**
 * date/time intentionally removed.
 *
 * Client selects a real availabilityId and Backend derives
 * the appointment time from LawyerAvailability.
 */
export const createConsultationBookingSchema =
  z
    .object({
      lawyerId:
        MongoIdSchema,

      availabilityId:
        MongoIdSchema,

      type:
        ConsultationTypeSchema,

      description:
        z
          .string()
          .trim()
          .max(
            3000,

            "توضیحات رزرو نمی‌تواند بیشتر از ۳۰۰۰ کاراکتر باشد",
          )
          .optional(),
    })
    .strict();


export const consultationBookingIdParamSchema =
  z
    .object({
      id:
        MongoIdSchema,
    })
    .strict();


export const updateConsultationBookingStatusSchema =
  z
    .object({
      status:
        z.enum([
          ConsultationBookingStatus.CONFIRMED,
          ConsultationBookingStatus.REJECTED,
          ConsultationBookingStatus.COMPLETED,
        ]),
    })
    .strict();


export const consultationBookingListQuerySchema =
  z
    .object({
      status:
        ConsultationBookingStatusSchema
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
            20,
          ),
    })
    .strict();


export type CreateConsultationBookingInput =
  z.output<
    typeof createConsultationBookingSchema
  >;


export type UpdateConsultationBookingStatusInput =
  z.output<
    typeof updateConsultationBookingStatusSchema
  >;


export type ConsultationBookingListQuery =
  z.output<
    typeof consultationBookingListQuerySchema
  >;
  