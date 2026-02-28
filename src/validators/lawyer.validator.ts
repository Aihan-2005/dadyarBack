import { z } from "zod";
import { SKILL_LEVELS } from "../models/lawyer.model";


export const UpdateProfileSchema = z.object({
  name: z.string().min(1).transform(v => v.trim()).optional(),
  lastname: z.string().min(1).transform(v => v.trim()).optional(),
  website: z.url().transform(v => v.trim()).optional(),
  bio: z.string().transform(v => v.trim()).optional(),
  yearsOfExperience: z.number().int().min(0).optional(),
  address: z
    .object({
      province: z.string().min(1).transform(v => v.trim()),
      city: z.string().min(1).transform(v => v.trim()),
      fullAddress: z.string().min(1).transform(v => v.trim()),
    })
    .optional(),
});

export const AddStudySchema = z.object({
  graduationYear: z.number().int().min(1300).max(1500),
  degree: z.string().min(1).transform(v => v.trim()),
  college: z.string().min(1).transform(v => v.trim()),
  field: z.string().min(1).transform(v => v.trim()),
});

export const LanguageBodySchema = z.object({
  language: z.string().min(1).transform(v => v.trim()),
});

export const SkillLevelsSchema = z.enum(SKILL_LEVELS);

export const AddSkillSchema = z.object({
  name: z.string().min(1).transform(v => v.trim()),
  level: SkillLevelsSchema,
});

export const UpdateSkillLevelSchema = z.object({
  level: SkillLevelsSchema,
});

export const ParamIdSchema = z.object({
  id: z.string().min(1),
});

export const ParamNameSchema = z.object({
  name: z.string().min(1).transform(v => v.trim()),
});

export const ParamStudyIdSchema = z.object({
  studyId: z.string().min(1),
});

export const AddWorkExperienceSchema = z.object({
  title: z.string().min(1).transform(v => v.trim()),
  organization: z.string().min(1).transform(v => v.trim()),
  startYear: z.number().int().min(1300).max(1500),
  endYear: z.number().int().min(1300).max(1500),
  description: z.string().transform(v => v.trim()).optional().nullable(),
});

export const ParamWorkExperienceIdSchema = z.object({
  id: z.string().min(1),
});
