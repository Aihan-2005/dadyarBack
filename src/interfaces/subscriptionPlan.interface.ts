import type { InferSchemaType } from "mongoose";

import type { z } from "zod";

import { SubscriptionPlanSchema } from "../models/subscriptionPlan.model";

import {
  CreateSubscriptionPlanSchema,
  UpdateSubscriptionPlanSchema,
} from "../validators/subscriptionPlan.validator";

export type SubscriptionPlan = InferSchemaType<
  typeof SubscriptionPlanSchema
> & {
  createdAt: Date;

  updatedAt: Date;
};

export type CreateSubscriptionPlanInput = z.infer<
  typeof CreateSubscriptionPlanSchema
>;

export type UpdateSubscriptionPlanInput = z.infer<
  typeof UpdateSubscriptionPlanSchema
>;

export type SubscriptionTier = SubscriptionPlan["tier"];

export type SubscriptionFeature = SubscriptionPlan["features"][number];
