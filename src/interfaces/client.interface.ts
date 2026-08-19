import { Types } from "mongoose";
import { z } from "zod";

import {
  CreateClientSchema,
  UpdateClientSchema,
} from "../validators/client.validator";

 

export type ClientCreatePayload = z.infer<typeof CreateClientSchema>;

export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;

 

export type Client = {
  lawyerId: Types.ObjectId;

  fullName: string;

  phone: string;

  nationalId?: string;

   
  homeNumber?: string;

  birthday?: Date;

  homeAddress?: string;

  represent?: string;

  description?: string;

 
  personalPasswordHash?: string;

  createdAt: Date;

  updatedAt: Date;
};

export type ClientRecord = Client & {
  _id: Types.ObjectId;
};

export type CreateClientRecordInput = Omit<
  Client,
  "lawyerId" | "createdAt" | "updatedAt"
>;

 
export type FindClientsOptions = {
  search?: string;

  page?: number;

  limit?: number;
};

 

export type ManualCaseClientInput = {
  fullName?: string;

  phone: string;

  nationalId?: string;

  represent?: string;
};

export type PopulatedClient = {
  _id: Types.ObjectId;

  fullName: string;

  phone: string;

  nationalId?: string | null;

  represent?: string | null;
};