import type {
  InferSchemaType,
  Types,
} from "mongoose";

import type {
  z,
} from "zod";

import {
  LawyerAvailabilitySchema,
} from "../models/lawyerAvailability.model";

import {
  CreateLawyerAvailabilitySchema,
  LawyerAvailabilityListQuerySchema,
  UpdateLawyerAvailabilitySchema,
} from "../validators/lawyerAvailability.validator";


export type LawyerAvailability =
  InferSchemaType<
    typeof LawyerAvailabilitySchema
  >;


export type LawyerAvailabilityRecord =
  LawyerAvailability & {
    _id:
      Types.ObjectId;

    createdAt:
      Date;

    updatedAt:
      Date;
  };


export type CreateLawyerAvailabilityInput =
  z.output<
    typeof CreateLawyerAvailabilitySchema
  >;


export type UpdateLawyerAvailabilityInput =
  z.output<
    typeof UpdateLawyerAvailabilitySchema
  >;


export type LawyerAvailabilityListOptions =
  z.output<
    typeof LawyerAvailabilityListQuerySchema
  >;