import { Types } from "mongoose";

export interface Client {
  lawyerId: Types.ObjectId;

  fullName: string;

  phone: string;

  nationalId?: string;

  homeNumber?: string;

  birthday?: Date;

  homeAddress?: string;
}

export interface ClientRecord extends Client {
  _id: Types.ObjectId;

  createdAt: Date;

  updatedAt: Date;
}

export type ClientCreatePayload = Omit<Client, "lawyerId">;

export type UpdateClientInput = Partial<Omit<Client, "lawyerId">>;

export interface FindClientsOptions {
  search?: string;

  page?: number;

  limit?: number;
}

export interface ManualCaseClientInput {
  fullName: string;
  phone: string;
  nationalId?: string;
}
