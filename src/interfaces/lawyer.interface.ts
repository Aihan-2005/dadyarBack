import type { InferSchemaType, Types } from "mongoose";

import type { z } from "zod";

import {
  EducationSchema,
  LawyerSchema,
  SkillSchema,
  WorkExperienceSchema,
} from "../models/lawyer.model";

import {
  LawyerEducationSchema,
  LawyerExperienceSchema,
  LawyerProfileSchema,
  LawyerSkillLevelSchema,
  LawyerSkillSchema,
} from "../validators/lawyer.validator";

import { SignupSchema } from "../validators/auth.validator";

export type SkillLevel = z.output<typeof LawyerSkillLevelSchema>;

export type Lawyer = InferSchemaType<typeof LawyerSchema>;

export type Education = InferSchemaType<typeof EducationSchema> & {
  _id?: Types.ObjectId;
};

export type WorkExperience = InferSchemaType<typeof WorkExperienceSchema> & {
  _id?: Types.ObjectId;
};

export type Skill = InferSchemaType<typeof SkillSchema> & {
  _id?: Types.ObjectId;
};

export type LawyerRecord = Lawyer & {
  _id: Types.ObjectId;

  createdAt: Date;

  updatedAt: Date;
};

export type LawyerEducationInput = z.output<typeof LawyerEducationSchema>;

export type LawyerExperienceInput = z.output<typeof LawyerExperienceSchema>;

export type LawyerSkillInput = z.output<typeof LawyerSkillSchema>;

export type LawyerProfileInput = z.output<typeof LawyerProfileSchema>;

type SignupInput = z.output<typeof SignupSchema>;

export type CreateLawyerData = Pick<SignupInput, "firstName" | "lastName">;
