import type { InferSchemaType } from "mongoose";

import type { z } from "zod";

import {
  LAWYER_SUBSCRIPTION_ACTIVATION_SOURCES,
  LAWYER_SUBSCRIPTION_STATUSES,
} from "../constants/lawyerSubscription.constants";

import { LawyerSubscriptionSchema } from "../models/lawyerSubscription.model";

import { CreateLawyerSubscriptionSchema } from "../validators/lawyerSubscription.validator";

export type LawyerSubscription = InferSchemaType<
  typeof LawyerSubscriptionSchema
>;

export type CreateLawyerSubscriptionInput = z.infer<
  typeof CreateLawyerSubscriptionSchema
>;

export type LawyerSubscriptionActivationSource =
  (typeof LAWYER_SUBSCRIPTION_ACTIVATION_SOURCES)[number];

export type LawyerSubscriptionStatus =
  (typeof LAWYER_SUBSCRIPTION_STATUSES)[number];

export type LawyerSubscriptionPlanSnapshot = LawyerSubscription["planSnapshot"];

export type CreateLawyerSubscriptionData = Pick<
  LawyerSubscription,
  | "lawyerId"
  | "planId"
  | "planSnapshot"
  | "startsAt"
  | "endsAt"
  | "cancelledAt"
  | "activationSource"
  | "activatedByUserId"
>;
