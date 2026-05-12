import { Types } from "mongoose";
import { z } from "zod";
import { SKILL_LEVELS } from "../models/lawyer.model";
import { MongoIdSchema } from "./case.validator";
import { MESSAGES } from "../constants/messages";
import { env } from "../config/env";

const LANGUAGE = env.LANGUAGE;

const RequiredString = z.string().trim().min(1);

const OptionalString = z.string().trim().optional();

const OptionalNullableString = z.string().trim().optional().nullable();

export const UpdateProfileSchema = z.object({
  name: RequiredString.optional(),

  lastname: RequiredString.optional(),

  website: z.string().trim().url().optional(),

  bio: OptionalString,

  yearsOfExperience: z.number().int().min(0).max(80).optional(),

  address: z
    .object({
      province: RequiredString,

      city: RequiredString,

      fullAddress: RequiredString.max(200),
    })
    .optional(),
});

export const LanguageBodySchema = z.object({
  language: RequiredString,
});

export const SkillLevelsSchema = z.enum(SKILL_LEVELS);

export const AddSkillSchema = z.object({
  name: RequiredString,

  level: SkillLevelsSchema,
});

export const UpdateSkillLevelSchema = z.object({
  level: SkillLevelsSchema,
});

export const ParamIdSchema = z.object({
  id: MongoIdSchema,
});

export const ParamNameSchema = z.object({
  name: RequiredString,
});

export const AddWorkExperienceSchema = z
  .object({
    title: RequiredString,

    organization: RequiredString,

    startYear: z.number().int().min(1300).max(1500),

    endYear: z.number().int().min(1300).max(1500),

    description: OptionalNullableString,
  })
  .refine((data) => data.endYear >= data.startYear, {
    message: MESSAGES["endYearBeforeStart"][LANGUAGE],
    path: ["endYear"],
  });

export const ParamWorkExperienceIdSchema = z.object({
  id: MongoIdSchema,
});
