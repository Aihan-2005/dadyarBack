import { Types } from "mongoose";
import { z } from "zod";
import {
  CreateClientSchema,
  UpdateClientSchema,
} from "../validators/client.validator";

export type ClientCreatePayload = z.infer<typeof CreateClientSchema>;

export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;

export type Client = ClientCreatePayload & {
  lawyerId: Types.ObjectId;

  createdAt: Date;

  updatedAt: Date;
};

export type ClientRecord = Client & {
  _id: Types.ObjectId;
};

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
