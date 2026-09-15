import type { InferSchemaType, Types } from "mongoose";
import type { z } from "zod";

import { ClientProfileSchema } from "../models/clientProfile.model";
import { UpdateClientProfileSchema } from "../validators/clientProfile.validator";

export type ClientProfile = InferSchemaType<typeof ClientProfileSchema> & {
  createdAt: Date;
  updatedAt: Date;
};

export type ClientProfileRecord = ClientProfile & {
  _id: Types.ObjectId;
};

export type UpdateClientProfileInput = z.output<
  typeof UpdateClientProfileSchema
>;