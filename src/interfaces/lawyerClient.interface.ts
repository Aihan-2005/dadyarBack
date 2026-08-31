import type { InferSchemaType, Types } from "mongoose";

import type { z } from "zod";

import { LawyerClientSchema } from "../models/lawyerClient.model";

import {
  CreateLawyerClientSchema,
  ListLawyerClientsQuerySchema,
  UpdateLawyerClientSchema,
} from "../validators/lawyerClient.validator";

export type LawyerClient = InferSchemaType<typeof LawyerClientSchema> & {
  createdAt: Date;

  updatedAt: Date;
};

export type LawyerClientRecord = LawyerClient & {
  _id: Types.ObjectId;
};

export type LawyerClientCreatePayload = z.output<
  typeof CreateLawyerClientSchema
>;

export type UpdateLawyerClientInput = z.output<typeof UpdateLawyerClientSchema>;

export type FindLawyerClientsOptions = Partial<
  z.output<typeof ListLawyerClientsQuerySchema>
>;

export type CreateLawyerClientRecordInput = LawyerClientCreatePayload;

export type ManualCaseLawyerClientInput = {
  fullName?: string;

  phone: string;

  nationalId?: string;

  birthDate?: Date;

  represent?: string;
};

export type PopulatedLawyerClient = {
  _id: Types.ObjectId;

  fullName: string;

  phone: string;

  nationalId?: string | null;

  birthday?: Date | null;

  represent?: string | null;
};

