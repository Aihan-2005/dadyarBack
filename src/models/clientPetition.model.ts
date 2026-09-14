import {
  model,
  Schema,
} from "mongoose";

import {
  CLIENT_PETITION_STATUSES,
} from "../constants/clientPetition.constants";

export const ClientPetitionSchema =
  new Schema(
    {
      clientId: {
        type:
          Schema.Types.ObjectId,

        ref:
          "User",

        required:
          true,

        immutable:
          true,

        index:
          true,
      },

      title: {
        type:
          String,

        required:
          true,

        trim:
          true,

        maxlength:
          200,
      },

      caseNumber: {
        type:
          String,

        trim:
          true,

        maxlength:
          100,

        default:
          "",
      },

      court: {
        type:
          String,

        trim:
          true,

        maxlength:
          200,

        default:
          "",
      },

      subject: {
        type:
          String,

        trim:
          true,

        maxlength:
          500,

        default:
          "",
      },

      facts: {
        type:
          String,

        trim:
          true,

        maxlength:
          10_000,

        default:
          "",
      },

      arguments: {
        type:
          String,

        trim:
          true,

        maxlength:
          15_000,

        default:
          "",
      },

      evidence: {
        type: [
          {
            type:
              String,

            trim:
              true,

            maxlength:
              1_000,
          },
        ],

        default:
          [],

        validate: {
          validator: (
            items: string[],
          ) =>
            items.length <=
            20,

          message:
            "تعداد مستندات نمی‌تواند بیشتر از ۲۰ مورد باشد",
        },
      },

      requestedRelief: {
        type:
          String,

        trim:
          true,

        maxlength:
          5_000,

        default:
          "",
      },

      status: {
        type:
          String,

        enum:
          CLIENT_PETITION_STATUSES,

        required:
          true,

        default:
          "DRAFT",

        index:
          true,
      },

      submittedAt: {
        type:
          Date,

        default:
          null,
      },
    },

    {
      timestamps:
        true,
    },
  );


ClientPetitionSchema.index({
  clientId:
    1,

  updatedAt:
    -1,
});


ClientPetitionSchema.index({
  clientId:
    1,

  status:
    1,

  updatedAt:
    -1,
});


export const ClientPetitionModel =
  model(
    "ClientPetition",

    ClientPetitionSchema,
  );