import { model, Schema } from "mongoose";

import { env } from "../config/env";

import {
  DEFAULT_LAWYER_ROLE,
  DEFAULT_LAWYER_STATUS,
  LAWYER_ROLES,
  LAWYER_STATUSES,
} from "../constants/lawyer.constants";

import { MESSAGES } from "../constants/messages.constants";

import type {
  Lawyer,
  Skill,
  WorkExperience,
} from "../interfaces/lawyer.interface";

export const SKILL_LEVELS = [1, 2, 3, 4, 5] as const;

export const WorkExperienceSchema = new Schema<WorkExperience>({
  title: {
    type: String,
    trim: true,
    maxlength: 150,
  },

  company: {
    type: String,
    trim: true,
    maxlength: 150,
  },

  startYear: {
    type: String,
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
  },
});

export const SkillSchema = new Schema<Skill>({
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
});

export const LawyerSchema = new Schema<Lawyer>(
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

    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true,
    },

    phone: {
      type: String,
      match: /^09\d{9}$/,
      unique: true,
      trim: true,
      sparse: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: Object.values(LAWYER_ROLES),
      default: DEFAULT_LAWYER_ROLE,
      required: true,
      immutable: true,
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(LAWYER_STATUSES),
      default: DEFAULT_LAWYER_STATUS,
      required: true,
      index: true,
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    phoneVerifiedAt: {
      type: Date,
      default: null,
    },

    licenseVerifiedAt: {
      type: Date,
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    specialization: {
      type: String,
      trim: true,
      maxlength: 150,
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
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    experience: {
      type: [WorkExperienceSchema],
      default: [],
    },

    skills: {
      type: [SkillSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

LawyerSchema.pre("validate", function () {
  if (!this.email && !this.phone) {
    throw new Error(MESSAGES.noEmailNorPhone[env.LANGUAGE]);
  }
});

const LawyerModel = model<Lawyer>("Lawyer", LawyerSchema);

export default LawyerModel;
