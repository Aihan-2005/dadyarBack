import {
  env,
} from "../config/env";

import {
  MESSAGES,
} from "../constants/messages.constants";

import {
  SUBSCRIPTION_FEATURE_DEFINITIONS,
  SUBSCRIPTION_FEATURES,
  SUBSCRIPTION_TIERS,
} from "../constants/subscription.constants";

import {
  toSubscriptionPlanDTO,
} from "../dtos/subscriptionPlan.dto";

import {
  HttpException,
} from "../exceptions/httpException";

import type {
  CreateSubscriptionPlanInput,
  UpdateSubscriptionPlanInput,
} from "../interfaces/subscriptionPlan.interface";

import {
  SubscriptionPlanRepository,
} from "../repositories/subscriptionPlan.repository";

import {
  SubscriptionSettingsRepository,
} from "../repositories/subscriptionSettings.repository";

const LANGUAGE =
  env.LANGUAGE;

export class SubscriptionPlanService {
  constructor(
    private readonly repository:
      SubscriptionPlanRepository =
        new SubscriptionPlanRepository(),

    private readonly settingsRepository:
      SubscriptionSettingsRepository =
        new SubscriptionSettingsRepository(),
  ) {}

  public async listPublicPlans() {
    const plans =
      await this.repository
        .findPublicPlans();

    return plans.map(
      (
        plan,
      ) =>
        toSubscriptionPlanDTO(
          plan,
        ),
    );
  }

  public async getPublicPlan(
    id:
      string,
  ) {
    const plan =
      await this.repository
        .findPublicPlanById(
          id,
        );

    if (
      !plan
    ) {
      throw new HttpException(
        404,

        MESSAGES
          .subscriptionPlanNotFound[
            LANGUAGE
          ],

        "SUBSCRIPTION_PLAN_NOT_FOUND",
      );
    }

    return toSubscriptionPlanDTO(
      plan,
    );
  }

  public async listPlansForAdmin() {
    const plans =
      await this.repository
        .findAllForAdmin();

    return plans.map(
      (
        plan,
      ) =>
        toSubscriptionPlanDTO(
          plan,
        ),
    );
  }

  public async createPlan(
    input:
      CreateSubscriptionPlanInput,
  ) {
    const plan =
      await this.repository
        .createPlan(
          input,
        );

    return toSubscriptionPlanDTO(
      plan,
    );
  }

  public async updatePlan(
    id:
      string,

    input:
      UpdateSubscriptionPlanInput,
  ) {
    const plan =
      await this.repository
        .updatePlan(
          id,
          input,
        );

    if (
      !plan
    ) {
      throw new HttpException(
        404,

        MESSAGES
          .subscriptionPlanNotFound[
            LANGUAGE
          ],

        "SUBSCRIPTION_PLAN_NOT_FOUND",
      );
    }

    return toSubscriptionPlanDTO(
      plan,
    );
  }

  public getPlanOptions() {
    return {
      tiers:
        SUBSCRIPTION_TIERS,

      features:
        SUBSCRIPTION_FEATURES.map(
          (
            code,
          ) => ({
            code,

            ...SUBSCRIPTION_FEATURE_DEFINITIONS[
              code
            ],
          }),
        ),
    };
  }

  public async getSettings() {
    const settings =
      await this.settingsRepository
        .getOrCreate();

    if (
      !settings
    ) {
      throw new Error(
        "Unable to load subscription settings",
      );
    }

    return {
      trialDays:
        settings.trialDays,
    };
  }

  public async updateSettings(
    input: {
      trialDays:
        number;
    },
  ) {
    const settings =
      await this.settingsRepository
        .updateTrialDays(
          input.trialDays,
        );

    if (
      !settings
    ) {
      throw new Error(
        "Unable to update subscription settings",
      );
    }

    return {
      trialDays:
        settings.trialDays,
    };
  }
}