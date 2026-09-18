import {
  model,
  Schema,
} from "mongoose";

import {
  ONLINE_CONTRACT_ACTORS,
  ONLINE_CONTRACT_AUDIT_ACTIONS,
  ONLINE_CONTRACT_PAYMENT_MODES,
  ONLINE_CONTRACT_STATUSES,
  ONLINE_CONTRACT_TEMPLATE_KEYS,
  ONLINE_CONTRACT_VERSION_AUTHORS,
} from "../constants/onlineContract.constants";

const ClientPartySchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 32,
    },

    nationalId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10,
    },

    address: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    _id: false,
    versionKey: false,
  },
);

const LawyerPartySchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    specialization: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    licenseNumber: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    _id: false,
    versionKey: false,
  },
);

const TemplateSnapshotSchema = new Schema(
  {
    key: {
      type: String,
      enum: ONLINE_CONTRACT_TEMPLATE_KEYS,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    lawyerObligations: {
      type: [String],
      required: true,
      default: [],
    },

    clientObligations: {
      type: [String],
      required: true,
      default: [],
    },

    standardTerms: {
      type: [String],
      required: true,
      default: [],
    },
  },
  {
    _id: false,
    versionKey: false,
  },
);

const DraftSchema = new Schema(
  {
    templateKey: {
      type: String,
      enum: ONLINE_CONTRACT_TEMPLATE_KEYS,
      required: true,
    },

    client: {
      type: ClientPartySchema,
      required: true,
    },

    lawyer: {
      type: LawyerPartySchema,
      required: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },

    scope: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1600,
    },

    feeToman: {
      type: Number,
      required: true,
      min: 1,
    },

    paymentMode: {
      type: String,
      enum: ONLINE_CONTRACT_PAYMENT_MODES,
      required: true,
    },

    paymentDetails: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    startDate: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },

    servicePeriod: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    additionalTerms: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },
  },
  {
    _id: false,
    versionKey: false,
  },
);

const VersionSchema = new Schema(
  {
    version: {
      type: Number,
      required: true,
      min: 1,
    },

    draft: {
      type: DraftSchema,
      required: true,
    },

    createdBy: {
      type: String,
      enum: ONLINE_CONTRACT_VERSION_AUTHORS,
      required: true,
    },

    createdAt: {
      type: Date,
      required: true,
    },

    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    _id: false,
    versionKey: false,
  },
);

const AuditEventSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },

    action: {
      type: String,
      enum: ONLINE_CONTRACT_AUDIT_ACTIONS,
      required: true,
    },

    actor: {
      type: String,
      enum: ONLINE_CONTRACT_ACTORS,
      required: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2500,
    },

    createdAt: {
      type: Date,
      required: true,
    },
  },
  {
    _id: false,
    versionKey: false,
  },
);

export const OnlineContractSchema = new Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
      index: true,
    },

    lawyerId: {
      type: Schema.Types.ObjectId,
      ref: "Lawyer",
      required: true,
      immutable: true,
      index: true,
    },

    reference: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      trim: true,
      maxlength: 80,
    },

    version: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    status: {
      type: String,
      enum:
        Object.values(
          ONLINE_CONTRACT_STATUSES,
        ),
      required: true,
      default:
        ONLINE_CONTRACT_STATUSES.WAITING_LAWYER_REVIEW,
      index: true,
    },

    templateSnapshot: {
      type: TemplateSnapshotSchema,
      required: true,
      immutable: true,
    },

    draft: {
      type: DraftSchema,
      required: true,
    },

    versions: {
      type: [VersionSchema],
      required: true,
      default: [],
    },

    completedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },

    clientFeedback: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },

    auditTrail: {
      type: [AuditEventSchema],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

OnlineContractSchema.index({
  clientId: 1,
  updatedAt: -1,
});

OnlineContractSchema.index({
  lawyerId: 1,
  status: 1,
  updatedAt: -1,
});

export const OnlineContractModel = model(
  "OnlineContract",
  OnlineContractSchema,
);
