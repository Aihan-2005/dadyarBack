import {
  model,
  Schema,
} from "mongoose";

import {
  CASE_PAYMENT_TYPES,
  CASE_STATES,
  COURT_TYPES,
} from "../constants/case.constants";

import {
  env,
} from "../config/env";

import {
  MESSAGES,
} from "../constants/messages.constants";

const LANGUAGE =
  env.LANGUAGE;


const CourtSchema =
  new Schema(
    {
      type: {
        type:
          String,

        enum:
          COURT_TYPES,

        required:
          true,
      },

      province: {
        type:
          String,

        required:
          true,

        trim:
          true,
      },

      city: {
        type:
          String,

        required:
          true,

        trim:
          true,
      },

      branch: {
        type:
          String,

        required:
          true,

        trim:
          true,
      },

      branchCode: {
        type:
          String,

        trim:
          true,

        maxlength:
          2000,
      },
    },

    {
      _id:
        false,
    }
  );



const BranchHistorySchema =
  new Schema(
    {
      province: {
        type:
          String,

        trim:
          true,
      },

      city: {
        type:
          String,

        trim:
          true,
      },

      branchNumber: {
        type:
          String,

        trim:
          true,
      },

      archiveNumberBranch: {
        type:
          String,

        trim:
          true,
      },

      date: {
        type:
          Date,
      },

      isActive: {
        type:
          Boolean,

        required:
          true,

        default:
          false,
      },
    },

    {
      _id:
        false,
    }
  );


const CaseClientAssignmentSchema =
  new Schema(
    {
      clientId: {
        type:
          Schema.Types
            .ObjectId,

        ref:
          "Client",

        required:
          true,
      },

      assignedAmount: {
        type:
          Number,

        required:
          true,

        min:
          0,
      },

      role: {
        type:
          String,

        trim:
          true,

        maxlength:
          100,
      },

      represent: {
        type:
          String,

        trim:
          true,

        maxlength:
          200,
      },
    },

    {
      _id:
        false,
    }
  );


const OpposingPartySchema =
  new Schema(
    {
      fullName: {
        type:
          String,

        required:
          true,

        trim:
          true,
      },

      phone: {
        type:
          String,

        trim:
          true,
      },

      nationalId: {
        type:
          String,

        trim:
          true,
      },

      role: {
        type:
          String,

        trim:
          true,

        maxlength:
          100,
      },

      birthDate: {
        type:
          Date,
      },

      description: {
        type:
          String,

        trim:
          true,

        maxlength:
          2000,
      },
    },

    {
      _id:
        true,
    }
  );


const LawyerContactSchema =
  new Schema(
    {
      fullName: {
        type:
          String,

        required:
          true,

        trim:
          true,
      },

      phone: {
        type:
          String,

        required:
          true,

        trim:
          true,
      },

      barLicenseNumber: {
        type:
          String,

        trim:
          true,
      },

      licenseExpiresAt: {
        type:
          Date,
      },

      licensePlaceOfIssue: {
        type:
          String,

        trim:
          true,
      },
    },

    {
      _id:
        true,
    }
  );



const RelatedPersonSchema =
  new Schema(
    {
      fullName: {
        type:
          String,

        required:
          true,

        trim:
          true,
      },

      phone: {
        type:
          String,

        required:
          true,

        trim:
          true,
      },

      nationalId: {
        type:
          String,

        trim:
          true,
      },

      role: {
        type:
          String,

        trim:
          true,

        maxlength:
          100,
      },

      description: {
        type:
          String,

        trim:
          true,

        maxlength:
          2000,
      },
    },

    {
      _id:
        true,
    }
  );



export const CaseSchema =
  new Schema(
    {
  
      lawyerId: {
        type:
          Schema.Types
            .ObjectId,

        ref:
          "Lawyer",

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
      },

      caseNumber: {
        type:
          String,

        required:
          true,

        trim:
          true,
      },

      state: {
        type:
          String,

        enum:
          CASE_STATES,

        default:
          "PENDING",

        index:
          true,
      },

      description: {
        type:
          String,

        trim:
          true,

        maxlength:
          5000,
      },

      paymentType: {
        type:
          String,

        enum:
          CASE_PAYMENT_TYPES,

        default:
          "CASH",
      },

      nonCashDescription: {
        type:
          String,

        trim:
          true,

        maxlength:
          2000,
      },

      court: {
        type:
          CourtSchema,
      },

      branchHistory: {
        type: [
          BranchHistorySchema,
        ],

        default: [],
      },

      value: {
        type:
          Number,

        required:
          true,

        min:
          0,
      },

      clientAssignments: {
        type: [
          CaseClientAssignmentSchema,
        ],

        required:
          true,

        validate: {
          validator(
            value:
              unknown[]
          ) {
            return (
              value.length >
              0
            );
          },

          message:
            MESSAGES
              .caseNeedClient[
              LANGUAGE
            ],
        },
      },

      opposingParties: {
        type: [
          OpposingPartySchema,
        ],

        default: [],
      },

      assistantLawyers: {
        type: [
          LawyerContactSchema,
        ],

        default: [],
      },

      opposingLawyers: {
        type: [
          LawyerContactSchema,
        ],

        default: [],
      },

      relatedPeople: {
        type: [
          RelatedPersonSchema,
        ],

        default: [],
      },
    },

    {
      timestamps:
        true,
    }
  );



CaseSchema.index(
  {
    lawyerId:
      1,

    caseNumber:
      1,
  },

  {
    unique:
      true,
  }
);

CaseSchema.index({
  lawyerId:
    1,

  state:
    1,

  updatedAt:
    -1,
});

export const CaseModel =
  model(
    "Case",
    CaseSchema
  );