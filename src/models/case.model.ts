import { model, Schema } from "mongoose";
import { CASE_SATATE, COURT_TYPES } from "../constants/case.constants";

const CourtSchema = new Schema(
  {
    type: {
      type: String,
      enum: COURT_TYPES,
      required: true,
    },

    province: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    branch: {
      type: String,
      required: true,
      trim: true,
    },

    branchCode: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const ClientSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    nationalId: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      trim: true,
    },
  },
  { _id: true },
);

const OpposingPartySchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    nationalId: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },
  },
  { _id: true },
);

const LawyerContactSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    barLicenseNumber: {
      type: String,
      trim: true,
    },

    licenseExpiresAt: {
      type: Date,
    },

    licensePlaceOfIssue: {
      type: String,
      trim: true,
    },
  },
  { _id: true },
);

const RelatedPersonSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },
  },
  { _id: true },
);

export const CaseSchema = new Schema(
  {
    lawyerId: {
      type: Schema.Types.ObjectId,
      ref: "Lawyer",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    caseNumber: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      enum: CASE_SATATE,
      default: "PENDING",
      index: true,
    },

    court: {
      type: CourtSchema,
      //required: true,
    },

    clients: {
      type: [ClientSchema],
      required: true,
      default: [],
    },

    opposingParties: {
      type: [OpposingPartySchema],
      default: [],
    },

    assistantLawyers: {
      type: [LawyerContactSchema],
      default: [],
    },

    opposingLawyers: {
      type: [LawyerContactSchema],
      default: [],
    },

    relatedPeople: {
      type: [RelatedPersonSchema],
      default: [],
    },
  },
  { timestamps: true },
);

CaseSchema.index({ lawyerId: 1, caseNumber: 1 }, { unique: true });

CaseSchema.index({ lawyerId: 1, state: 1, updatedAt: -1 });

export const CaseModel = model("Case", CaseSchema);
