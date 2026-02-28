import { model, Schema } from "mongoose";


const CASE_STATES = ["PENDING", "IN_PROGRESS", "DONE", "ARCHIVED"] as const;

export const CaseSchema = new Schema({

  lawyerId: {
    type: Schema.Types.ObjectId,
    ref: "Lawyer",
    required: true,
    index: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  clientFullname: {
    type: String,
    required: true,
    trim: true
  },

  caseNumber: {
    type: String,
    required: true,
    trim: true
  },

  state: {
    type: String,
    enum: CASE_STATES,
    default: "PENDING",
    index: true
  }
}, { timestamps: true })

// INFO: just a way to make sure a lawyer don't take the same case twice
CaseSchema.index({ lawyerId: 1, caseNumber: 1 }, { unique: true });


export const CaseModel = model("Case", CaseSchema)
