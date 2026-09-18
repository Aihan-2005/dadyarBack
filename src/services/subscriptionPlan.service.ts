import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";
import {
  SUBSCRIPTION_FEATURE_DEFINITIONS,
  SUBSCRIPTION_FEATURES,
  SUBSCRIPTION_TIERS,
} from "../constants/subscription.constants";

import { HttpException } from "../exceptions/httpException";

import type {
  CreateSubscriptionPlanInput,
  UpdateSubscriptionPlanInput,
} from "../interfaces/subscriptionPlan.interface";

import { SubscriptionPlanRepository } from "../repositories/subscriptionPlan.repository";

const LANGUAGE = env.LANGUAGE;

export class SubscriptionPlanService {
  constructor(
    private readonly repository: SubscriptionPlanRepository = new SubscriptionPlanRepository(),
  ) {}

  public listPublicPlans() {
    return this.repository.findPublicPlans();
  }

  public async getPublicPlan(id: string) {
    const plan = await this.repository.findPublicPlanById(id);

    if (!plan) {
      throw new HttpException(
        404,

        MESSAGES.subscriptionPlanNotFound[LANGUAGE],

        "SUBSCRIPTION_PLAN_NOT_FOUND",
      );
    }

    return plan;
  }

  public listPlansForAdmin() {
    return this.repository.findAllForAdmin();
  }

  public createPlan(input: CreateSubscriptionPlanInput) {
    return this.repository.createPlan(input);
  }

  public async updatePlan(
    id: string,

    input: UpdateSubscriptionPlanInput,
  ) {
    const plan = await this.repository.updatePlan(id, input);

    if (!plan) {
      throw new HttpException(
        404,

        MESSAGES.subscriptionPlanNotFound[LANGUAGE],

        "SUBSCRIPTION_PLAN_NOT_FOUND",
      );
    }

    return plan;
  }

  public getPlanOptions() {
    return {
      tiers: SUBSCRIPTION_TIERS,

      features: SUBSCRIPTION_FEATURES.map((code) => ({
        code,

        ...SUBSCRIPTION_FEATURE_DEFINITIONS[code],
      })),
    };
  }
}
