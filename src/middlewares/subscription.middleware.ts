import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";

import { HttpException } from "../exceptions/httpException";

import type { SubscriptionFeature } from "../interfaces/subscriptionPlan.interface";

import { LawyerSubscriptionRepository } from "../repositories/lawyerSubscription.repository";

const LANGUAGE = env.LANGUAGE;

const lawyerSubscriptionRepository = new LawyerSubscriptionRepository();

export const requireActiveSubscription = async (
  req: Request,

  res: Response,

  next: NextFunction,
): Promise<void> => {
  try {
    const lawyerId = req.user!.id;

    const subscription =
      await lawyerSubscriptionRepository.findCurrentByLawyerId(lawyerId);

    if (!subscription) {
      throw new HttpException(
        403,

        MESSAGES.activeSubscriptionRequired[LANGUAGE],

        "ACTIVE_SUBSCRIPTION_REQUIRED",
      );
    }

    res.locals.lawyerSubscription = subscription;

    next();
  } catch (error) {
    next(error);
  }
};

export const requireSubscriptionFeature =
  (feature: SubscriptionFeature) =>
  async (
    req: Request,

    res: Response,

    next: NextFunction,
  ): Promise<void> => {
    try {
      let subscription = res.locals.lawyerSubscription;

      if (!subscription) {
        subscription = await lawyerSubscriptionRepository.findCurrentByLawyerId(
          req.user!.id,
        );
      }

      if (!subscription) {
        throw new HttpException(
          403,

          MESSAGES.activeSubscriptionRequired[LANGUAGE],

          "ACTIVE_SUBSCRIPTION_REQUIRED",
        );
      }

      if (!subscription.planSnapshot.features.includes(feature)) {
        throw new HttpException(
          403,

          MESSAGES.subscriptionFeatureRequired[LANGUAGE],

          "SUBSCRIPTION_FEATURE_REQUIRED",
        );
      }

      res.locals.lawyerSubscription = subscription;

      next();
    } catch (error) {
      next(error);
    }
  };
