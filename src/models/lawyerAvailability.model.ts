import {
  model,
  Schema,
} from "mongoose";

import {
  ConsultationType,
} from "../constants/consultationBooking.constants";


export const LawyerAvailabilitySchema =
  new Schema(
    {
      lawyerId: {
        type:
          Schema.Types.ObjectId,

        ref:
          "Lawyer",

        required:
          true,

        immutable:
          true,

        index:
          true,
      },

      startsAt: {
        type:
          Date,

        required:
          true,

        index:
          true,
      },

      endsAt: {
        type:
          Date,

        required:
          true,
      },

      consultationTypes: {
        type: [
          {
            type:
              String,

            enum:
              Object.values(
                ConsultationType,
              ),
          },
        ],

        required:
          true,

        validate: {
          validator: (
            value:
              ConsultationType[],
          ) =>
            Array.isArray(
              value,
            ) &&
            value.length >
              0,

          message:
            "حداقل یک نوع مشاوره لازم است",
        },
      },

      note: {
        type:
          String,

        trim:
          true,

        maxlength:
          1000,

        default:
          "",
      },

      isActive: {
        type:
          Boolean,

        required:
          true,

        default:
          true,

        index:
          true,
      },

      /**
       * هنگام رزرو به‌صورت atomic روی true می‌رود.
       *
       * Client هیچ‌وقت اجازه تغییر این مقدار را ندارد.
       */
      isReserved: {
        type:
          Boolean,

        required:
          true,

        default:
          false,

        index:
          true,
      },
    },

    {
      timestamps:
        true,
    },
  );


LawyerAvailabilitySchema.index({
  lawyerId:
    1,

  startsAt:
    1,

  endsAt:
    1,
});


LawyerAvailabilitySchema.index({
  lawyerId:
    1,

  isActive:
    1,

  isReserved:
    1,

  startsAt:
    1,
});


export const LawyerAvailabilityModel =
  model(
    "LawyerAvailability",

    LawyerAvailabilitySchema,
  );