import { Types } from "mongoose";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";

import { SUBSCRIPTION_MONTH_DURATION_IN_MS } from "../constants/lawyerSubscription.constants";

import { toLawyerSubscriptionDTO } from "../dtos/lawyerSubscription.dto";

import { HttpException } from "../exceptions/httpException";

import type { CreateLawyerSubscriptionInput } from "../interfaces/lawyerSubscription.interface";

import { LawyerSubscriptionRepository } from "../repositories/lawyerSubscription.repository";

import { SubscriptionPlanRepository } from "../repositories/subscriptionPlan.repository";

import { LawyerRepository } from "../repositories/lawyer.repository";

const LANGUAGE = env.LANGUAGE;

export class LawyerSubscriptionService {
  constructor(
    private readonly repository: LawyerSubscriptionRepository = new LawyerSubscriptionRepository(),

    private readonly subscriptionPlanRepository: SubscriptionPlanRepository = new SubscriptionPlanRepository(),

    private readonly lawyerRepository: LawyerRepository = new LawyerRepository(),
  ) {}

  public async getCurrentSubscription(lawyerId: string) {
    const subscription = await this.repository.findCurrentByLawyerId(lawyerId);

    if (!subscription) {
      return null;
    }

    return toLawyerSubscriptionDTO(subscription);
  }

  public async getSubscriptionHistory(lawyerId: string) {
    const subscriptions = await this.repository.findHistoryByLawyerId(lawyerId);

    return subscriptions.map((subscription) =>
      toLawyerSubscriptionDTO(subscription),
    );
  }

  public async createSubscriptionForAdmin(
    lawyerId: string,

    input: CreateLawyerSubscriptionInput,

    adminUserId: string,
  ) {
    const lawyer = await this.lawyerRepository.findById(lawyerId);

    if (!lawyer) {
      throw new HttpException(
        404,

        MESSAGES.noUserWithId[LANGUAGE],

        "LAWYER_NOT_FOUND",
      );
    }

    const plan = await this.subscriptionPlanRepository.findPublicPlanById(
      input.planId,
    );

    if (!plan) {
      throw new HttpException(
        404,

        MESSAGES.subscriptionPlanNotFound[LANGUAGE],

        "SUBSCRIPTION_PLAN_NOT_FOUND",
      );
    }

    const currentSubscription =
      await this.repository.findCurrentByLawyerId(lawyerId);

    if (currentSubscription) {
      throw new HttpException(
        409,

        MESSAGES.lawyerSubscriptionAlreadyActive[LANGUAGE],

        "LAWYER_SUBSCRIPTION_ALREADY_ACTIVE",
      );
    }

    const startsAt = new Date();

    const endsAt = new Date(
      startsAt.getTime() +
        plan.durationMonths * SUBSCRIPTION_MONTH_DURATION_IN_MS,
    );

    const subscription = await this.repository.createSubscription({
      lawyerId: lawyer._id,

      planId: plan._id,

      planSnapshot: {
        title: plan.title,

        description: plan.description,

        tier: plan.tier,

        tags: [...plan.tags],

        durationMonths: plan.durationMonths,

        price: plan.price,

        discountPercent: plan.discountPercent,

        features: [...plan.features],
      },

      startsAt,

      endsAt,

      cancelledAt: null,

      activationSource: "ADMIN",

      activatedByUserId: new Types.ObjectId(adminUserId),
    });

    return toLawyerSubscriptionDTO(subscription);
  }

  public async cancelCurrentSubscriptionForAdmin(lawyerId: string) {
    const lawyer = await this.lawyerRepository.findById(lawyerId);

    if (!lawyer) {
      throw new HttpException(
        404,

        MESSAGES.noUserWithId[LANGUAGE],

        "LAWYER_NOT_FOUND",
      );
    }

    const subscription =
      await this.repository.cancelCurrentByLawyerId(lawyerId);

    if (!subscription) {
      throw new HttpException(
        404,

        MESSAGES.lawyerSubscriptionNotFound[LANGUAGE],

        "LAWYER_SUBSCRIPTION_NOT_FOUND",
      );
    }

    return toLawyerSubscriptionDTO(subscription);
  }
}
