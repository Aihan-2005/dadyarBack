import type { Types } from "mongoose";

import type {
  LawyerRole,
  LawyerStatus,
} from "../constants/lawyer.constants";

export type SkillLevel = 1 | 2 | 3 | 4 | 5;

export interface Education {
  _id?: Types.ObjectId;

  degree: string;
  field: string;
  university: string;
  year: string;
}

export interface WorkExperience {
  _id?: Types.ObjectId;

  title: string;
  company: string;

  startYear: string;
  endYear: string;

  description?: string;
}

export interface Skill {
  _id?: Types.ObjectId;

  name: string;
  level: SkillLevel;
}

export interface Lawyer {
  firstName: string;
  lastName: string;

  email?: string;
  phone?: string;

  password: string;

  role: LawyerRole;
  status: LawyerStatus;

  emailVerifiedAt: Date | null;
  phoneVerifiedAt: Date | null;
  licenseVerifiedAt: Date | null;

  lastLoginAt: Date | null;

  specialization?: string;
  licenseNumber?: string;

  yearsOfExperience: number;

  website?: string;
  address?: string;
  bio?: string;

  education: Education[];
  experience: WorkExperience[];
  skills: Skill[];
  languages: string[];

  createdAt?: Date;
  updatedAt?: Date;
}

export interface LawyerRecord extends Lawyer {
  _id: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export interface LawyerAuthRecord extends LawyerRecord {
  password: string;
}

export interface LawyerAccessContext {
  _id: Types.ObjectId;

  role: LawyerRole;
  status: LawyerStatus;
}

export interface CreateLawyerInput {
  firstName: string;
  lastName: string;

  email?: string;
  phone?: string;

  password: string;
}

export interface LoginDTO {
  email?: string;
  phone?: string;

  password: string;
}