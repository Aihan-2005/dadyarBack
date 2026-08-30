import type { InferSchemaType, Types } from "mongoose";

import type { UserRole } from "../constants/user.constants";

import { UserSchema } from "../models/user.model";

export type User = InferSchemaType<typeof UserSchema> & {
  createdAt: Date;

  updatedAt: Date;
};

export type UserRecord = User & {
  _id: Types.ObjectId;
};

export type UserAuthRecord = UserRecord & {
  password: string;
};

export type UserAccessContext = {
  _id: Types.ObjectId;

  role: User["role"];

  status: User["status"];
};

export type CreateUserData = {
  email?: string;

  phone?: string;

  password: string;

  role: UserRole;

  emailVerifiedAt?: Date | null;

  phoneVerifiedAt?: Date | null;
};
