import { model, Schema } from "mongoose";
import { MESSAGES } from "../constants/messages";
import { env } from "../config/env";

export const SKILL_LEVELS = [
  "BEGINNER",
  "INTERMEDIATE",
  "GOOD",
  "ADVANCED",
  "EXPERT",
] as const;

export const WorkExperienceSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  organization: {
    type: String,
    required: true,
    trim: true,
  },

  startYear: {
    type: Number,
    min: 1300,
    max: 1500,
    required: true,
  },

  endYear: {
    type: Number,
    min: 1300,
    max: 1500,
    required: true,
  },

  description: {
    type: String,
    trim: true,
    maxlength: 2000,
  },
});

export const SkillSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  level: {
    type: String,
    required: true,
    enum: SKILL_LEVELS,
  },
});

const AddressSchema = new Schema(
  {
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

    fullAddress: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200,
    },
  },
  { _id: false },
);

export const LawyerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    lastname: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true, // for anyone who didn't know without this you can't have unique-index on optional filed becuase you could have a lot of null values
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
      select: false, // dont return pass when searching for lawyers
    },

    barLicenseNumber: {
      type: String,
      // required: true,
      unique: true,
      trim: true,
      index: true,
      sparse: true,
    },

    yearsOfExperience: {
      type: Number,
      min: 0,
      max: 80,
    },
    website: {
      type: String,
      trim: true,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    address: {
      type: AddressSchema,
    },

    workExperiences: {
      type: [WorkExperienceSchema],
      default: [],
    },

    skills: {
      type: [SkillSchema],
      default: [],
    },

    languages: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

LawyerSchema.pre("validate", function () {
  if (!this.email && !this.phone) {
    throw new Error(MESSAGES.noEmailNorPhone[env.LANGUAGE]);
  }
});

const LawyerModel = model("Lawyer", LawyerSchema);

export default LawyerModel;
