import type { InferSchemaType, Types } from "mongoose";

import type { z } from "zod";

import { UserSchema } from "../models/user.model";

import {
  CreateUserDataSchema,
  UserRoleSchema,
  UserStatusSchema,
} from "../validators/user.validator";

export type User = InferSchemaType<typeof UserSchema>;

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

export type UserRole = z.infer<typeof UserRoleSchema>;

export type UserStatus = z.infer<typeof UserStatusSchema>;

export type CreateUserData = z.infer<typeof CreateUserDataSchema>;
