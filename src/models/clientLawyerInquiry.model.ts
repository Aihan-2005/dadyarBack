import {
  model,
  Schema,
} from "mongoose";

import {
  CLIENT_LAWYER_INQUIRY_STATUSES,
} from "../constants/clientLawyerInquiry.constants";

export const ClientLawyerInquirySchema =
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

      lawyerClientId: {
        type:
          Schema.Types.ObjectId,

        ref:
          "LawyerClient",

        default:
          null,

        index:
          true,
      },

      subject: {
        type:
          String,

        required:
          true,

        trim:
          true,

        maxlength:
          200,
      },

      description: {
        type:
          String,

        required:
          true,

        trim:
          true,

        maxlength:
          5000,
      },

      status: {
        type:
          String,

        enum:
          CLIENT_LAWYER_INQUIRY_STATUSES,

        required:
          true,

        default:
          "SUBMITTED",

        index:
          true,
      },

      lawyerResponse: {
        type:
          String,

        trim:
          true,

        maxlength:
          5000,

        default:
          "",
      },

      respondedAt: {
        type:
          Date,

        default:
          null,
      },

      cancelledAt: {
        type:
          Date,

        default:
          null,
      },

      closedAt: {
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

ClientLawyerInquirySchema.index({
  clientId:
    1,

  createdAt:
    -1,
});

ClientLawyerInquirySchema.index({
  lawyerId:
    1,

  status:
    1,

  createdAt:
    -1,
});

export const ClientLawyerInquiryModel =
  model(
    "ClientLawyerInquiry",

    ClientLawyerInquirySchema,
  );
  