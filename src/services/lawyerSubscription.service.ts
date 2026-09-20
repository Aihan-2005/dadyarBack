import mongoose, { Types } from "mongoose";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";

import { SUBSCRIPTION_MONTH_DURATION_IN_MS } from "../constants/lawyerSubscription.constants";

import { toLawyerSubscriptionDTO } from "../dtos/lawyerSubscription.dto";

import { HttpException } from "../exceptions/httpException";

import type {
  CreateLawyerSubscriptionInput,
  LawyerSubscriptionHistoryOptions,
} from "../interfaces/lawyerSubscription.interface";

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

  public async getSubscriptionHistory(
    lawyerId: string,
    options: LawyerSubscriptionHistoryOptions,
  ) {
    const lawyer = await this.lawyerRepository.findById(lawyerId);

    if (!lawyer) {
      throw new HttpException(
        404,
        MESSAGES.noUserWithId[LANGUAGE],
        "LAWYER_NOT_FOUND",
      );
    }

    const result = await this.repository.findHistoryByLawyerId(
      lawyerId,
      options,
    );

    return {
      items: result.items.map((sub) => toLawyerSubscriptionDTO(sub)),

      pagination: {
        page: options.page,
        limit: options.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / options.limit),
      },
    };
  }

  public async createSubscriptionForAdmin(
    lawyerId: string,

    input: CreateLawyerSubscriptionInput,

    adminUserId: string,
  ) {
    const session = await mongoose.startSession();

    try {
      const subscription = await session.withTransaction(async () => {
        const plan = await this.subscriptionPlanRepository.findPublicPlanById(
          input.planId,
          session,
        );

        if (!plan) {
          throw new HttpException(
            404,

            MESSAGES.subscriptionPlanNotFound[LANGUAGE],

            "SUBSCRIPTION_PLAN_NOT_FOUND",
          );
        }

        const lawyer =
          await this.lawyerRepository.acquireSubscriptionWriteGuard(
            lawyerId,
            session,
          );

        if (!lawyer) {
          throw new HttpException(
            404,

            MESSAGES.noUserWithId[LANGUAGE],

            "LAWYER_NOT_FOUND",
          );
        }

        const startsAt = new Date();

        const currentSubscription = await this.repository.findCurrentByLawyerId(
          lawyerId,
          startsAt,
          session,
        );

        if (currentSubscription) {
          throw new HttpException(
            409,

            MESSAGES.lawyerSubscriptionAlreadyActive[LANGUAGE],

            "LAWYER_SUBSCRIPTION_ALREADY_ACTIVE",
          );
        }

        const endsAt = new Date(
          startsAt.getTime() +
            plan.durationMonths * SUBSCRIPTION_MONTH_DURATION_IN_MS,
        );

        return this.repository.createSubscription(
          {
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

            activationSource: "ADMIN",

            activatedByUserId: new Types.ObjectId(adminUserId),
          },

          session,
        );
      });

      if (!subscription) {
        throw new HttpException(
          500,

          MESSAGES.serverError[LANGUAGE],

          "LAWYER_SUBSCRIPTION_CREATE_FAILED",
        );
      }

      return toLawyerSubscriptionDTO(subscription);
    } finally {
      await session.endSession();
    }
  }

  public async cancelCurrentSubscriptionForAdmin(lawyerId: string) {
    const session = await mongoose.startSession();

    try {
      const subscription = await session.withTransaction(async () => {
        const lawyer =
          await this.lawyerRepository.acquireSubscriptionWriteGuard(
            lawyerId,
            session,
          );

        if (!lawyer) {
          throw new HttpException(
            404,

            MESSAGES.noUserWithId[LANGUAGE],

            "LAWYER_NOT_FOUND",
          );
        }

        const subscription = await this.repository.cancelCurrentByLawyerId(
          lawyerId,
          new Date(),
          session,
        );

        if (!subscription) {
          throw new HttpException(
            404,

            MESSAGES.lawyerSubscriptionNotFound[LANGUAGE],

            "LAWYER_SUBSCRIPTION_NOT_FOUND",
          );
        }

        return subscription;
      });

      if (!subscription) {
        throw new HttpException(
          500,

          MESSAGES.serverError[LANGUAGE],

          "LAWYER_SUBSCRIPTION_CANCEL_FAILED",
        );
      }

      return toLawyerSubscriptionDTO(subscription);
    } finally {
      await session.endSession();
    }
  }
}
