import { model, Schema } from "mongoose";

import {
  DEFAULT_LAWYER_STATUS,
  LAWYER_STATUSES,
  SKILL_LEVELS,
} from "../constants/lawyer.constants";

import type { Lawyer } from "../interfaces/lawyer.interface";

export const EducationSchema = new Schema(
  {
    degree: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },

    field: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },

    university: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },

    year: {
      type: String,
      trim: true,
      maxlength: 20,
      default: "",
    },
  },
  {
    versionKey: false,
  },
);

export const WorkExperienceSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    startYear: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },

    endYear: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
  },
  {
    versionKey: false,
  },
);

export const SkillSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    level: {
      type: Number,
      required: true,
      enum: SKILL_LEVELS,
      min: 1,
      max: 5,
    },
  },
  {
    versionKey: false,
  },
);

export const LawyerSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    status: {
      type: String,
      enum: Object.values(LAWYER_STATUSES),
      default: DEFAULT_LAWYER_STATUS,
      required: true,
      index: true,
    },

    licenseVerifiedAt: {
      type: Date,
      default: null,
    },

    specialization: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    licenseNumber: {
      type: String,
      unique: true,
      trim: true,
      sparse: true,
      maxlength: 50,
    },

    yearsOfExperience: {
      type: Number,
      required: true,
      min: 0,
      max: 80,
      default: 0,
    },

    website: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    address: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    education: {
      type: [EducationSchema],
      default: [],
    },

    experience: {
      type: [WorkExperienceSchema],
      default: [],
    },

    skills: {
      type: [SkillSchema],
      default: [],
    },

    languages: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 80,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const LawyerModel = model<Lawyer>("Lawyer", LawyerSchema);

export default LawyerModel;
