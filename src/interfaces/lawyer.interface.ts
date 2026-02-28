import { InferSchemaType } from "mongoose";
import { LawyerSchema, SkillSchema, StudySchema, WorkExperienceSchema } from "../models/lawyer.model";

export type Lawyer = InferSchemaType<typeof LawyerSchema>;
export type Study = InferSchemaType<typeof StudySchema>;
export type Skill = InferSchemaType<typeof SkillSchema>;
export type WorkExperience = InferSchemaType<typeof WorkExperienceSchema>;

export type Level = "BEGINNER" | "INTERMEDIATE" | "GOOD" | "ADVANCED" | "EXPERT";

export interface CreateLawyerInput {
  name: string;
  lastname: string;
  email?: string;
  phone?: string;
  password: string;
  barLicenseNumber: string;
  address: { province: string; city: string; fullAddress: string };
  yearsOfExperience: number;
  website?: string;
  bio?: string;
  studies?: Array<{ graduationYear: number; degree: string; college: string; field: string }>;
  workExperiences?: Array<{
    title: string;
    organization: string;
    startYear: number;
    endYear?: number;
    description?: string;
  }>;
  skills?: Array<{ name: string; level: Level }>;
  languages?: string[];
};

export interface LoginDTO {
  email?: string,
  phone?: string,
  password: string
}
