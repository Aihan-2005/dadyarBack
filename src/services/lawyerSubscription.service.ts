import mongoose, {
  Types,
} from "mongoose";

import type {
  ClientSession,
} from "mongoose";

import {
  env,
} from "../config/env";

import {
  MESSAGES,
} from "../constants/messages.constants";

import {
  SUBSCRIPTION_DAY_DURATION_IN_MS,
  SUBSCRIPTION_MONTH_DURATION_IN_MS,
} from "../constants/lawyerSubscription.constants";

import {
  SUBSCRIPTION_FEATURES,
} from "../constants/subscription.constants";

import {
  resolveSubscriptionPlanDurationDays,
} from "../dtos/subscriptionPlan.dto";

import {
  toLawyerSubscriptionDTO,
} from "../dtos/lawyerSubscription.dto";

import {
  HttpException,
} from "../exceptions/httpException";

import type {
  CreateLawyerSubscriptionInput,
  LawyerSubscriptionHistoryOptions,
} from "../interfaces/lawyerSubscription.interface";

import {
  LawyerSubscriptionRepository,
} from "../repositories/lawyerSubscription.repository";

import {
  SubscriptionPlanRepository,
} from "../repositories/subscriptionPlan.repository";

import {
  LawyerRepository,
} from "../repositories/lawyer.repository";

const LANGUAGE =
  env.LANGUAGE;

export class LawyerSubscriptionService {
  constructor(
    private readonly repository:
      LawyerSubscriptionRepository =
        new LawyerSubscriptionRepository(),

    private readonly subscriptionPlanRepository:
      SubscriptionPlanRepository =
        new SubscriptionPlanRepository(),

    private readonly lawyerRepository:
      LawyerRepository =
        new LawyerRepository(),
  ) {}

  public async getCurrentSubscription(
    lawyerId:
      string,
  ) {
    const subscription =
      await this.repository
        .findCurrentByLawyerId(
          lawyerId,
        );

    if (
      !subscription
    ) {
      return null;
    }

    return toLawyerSubscriptionDTO(
      subscription,
    );
  }

  public async getSubscriptionHistory(
    lawyerId:
      string,

    options:
      LawyerSubscriptionHistoryOptions,
  ) {
    const lawyer =
      await this.lawyerRepository
        .findById(
          lawyerId,
        );

    if (
      !lawyer
    ) {
      throw new HttpException(
        404,

        MESSAGES
          .noUserWithId[
            LANGUAGE
          ],

        "LAWYER_NOT_FOUND",
      );
    }

    const result =
      await this.repository
        .findHistoryByLawyerId(
          lawyerId,
          options,
        );

    return {
      items:
        result.items.map(
          (
            subscription,
          ) =>
            toLawyerSubscriptionDTO(
              subscription,
            ),
        ),

      pagination: {
        page:
          options.page,

        limit:
          options.limit,

        total:
          result.total,

        totalPages:
          Math.ceil(
            result.total /
              options.limit,
          ),
      },
    };
  }
 
  public async createInitialTrial(
    lawyerId:
      string,

    trialDays:
      number,

    session:
      ClientSession,
  ) {
    if (
      !Number.isInteger(
        trialDays,
      ) ||
      trialDays <
        1
    ) {
      throw new Error(
        "Invalid trial duration",
      );
    }

    const existing =
      await this.repository
        .hasAnyByLawyerId(
          lawyerId,
          session,
        );

    if (
      existing
    ) {
      return null;
    }

    const startsAt =
      new Date();

    const endsAt =
      new Date(
        startsAt.getTime() +
          trialDays *
            SUBSCRIPTION_DAY_DURATION_IN_MS,
      );

    return this.repository
      .createSubscription(
        {
          lawyerId:
            new Types.ObjectId(
              lawyerId,
            ),

          planId:
            null,

          planSnapshot: {
            title:
              "دوره رایگان دادیار",

            description:
              "دوره استفاده رایگان اولیه برای شروع کار با دادیار.",

            tier:
              "TRIAL",

            tags: [
              "رایگان",
            ],

            durationDays:
              trialDays,

            
            durationMonths:
              trialDays /
              30,

            price:
              0,

            discountPercent:
              0,

       
            features: [
              ...SUBSCRIPTION_FEATURES,
            ],
          },

          startsAt,

          endsAt,

          activationSource:
            "TRIAL",

          activatedByUserId:
            null,
        },

        session,
      );
  }

  public async createSubscriptionForAdmin(
    lawyerId:
      string,

    input:
      CreateLawyerSubscriptionInput,

    adminUserId:
      string,
  ) {
    const session =
      await mongoose
        .startSession();

    try {
      const subscription =
        await session
          .withTransaction(
            async () => {
              const plan =
                await this
                  .subscriptionPlanRepository
                  .findPublicPlanById(
                    input.planId,
                    session,
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

              const lawyer =
                await this
                  .lawyerRepository
                  .acquireSubscriptionWriteGuard(
                    lawyerId,
                    session,
                  );

              if (
                !lawyer
              ) {
                throw new HttpException(
                  404,

                  MESSAGES
                    .noUserWithId[
                      LANGUAGE
                    ],

                  "LAWYER_NOT_FOUND",
                );
              }

              const startsAt =
                new Date();

              const currentSubscription =
                await this.repository
                  .findCurrentByLawyerId(
                    lawyerId,
                    startsAt,
                    session,
                  );

              if (
                currentSubscription
              ) {
                throw new HttpException(
                  409,

                  MESSAGES
                    .lawyerSubscriptionAlreadyActive[
                      LANGUAGE
                    ],

                  "LAWYER_SUBSCRIPTION_ALREADY_ACTIVE",
                );
              }

              const durationDays =
                resolveSubscriptionPlanDurationDays(
                  plan,
                );

              
              const durationMonths =
                typeof plan.durationMonths ===
                  "number"
                  ? plan.durationMonths
                  : durationDays /
                    30;

              const endsAt =
                new Date(
                  startsAt.getTime() +
                    durationMonths *
                      SUBSCRIPTION_MONTH_DURATION_IN_MS,
                );

              return this.repository
                .createSubscription(
                  {
                    lawyerId:
                      lawyer._id,

                    planId:
                      plan._id,

                    planSnapshot: {
                      title:
                        plan.title,

                      description:
                        plan.description,

                      tier:
                        plan.tier,

                      tags: [
                        ...plan.tags,
                      ],

                      durationDays,

                      durationMonths,

                      price:
                        plan.price,

                      discountPercent:
                        plan.discountPercent,

                      features: [
                        ...plan.features,
                      ],
                    },

                    startsAt,

                    endsAt,

                    activationSource:
                      "ADMIN",

                    activatedByUserId:
                      new Types.ObjectId(
                        adminUserId,
                      ),
                  },

                  session,
                );
            },
          );

      if (
        !subscription
      ) {
        throw new HttpException(
          500,

          MESSAGES
            .serverError[
              LANGUAGE
            ],

          "LAWYER_SUBSCRIPTION_CREATE_FAILED",
        );
      }

      return toLawyerSubscriptionDTO(
        subscription,
      );
    } finally {
      await session
        .endSession();
    }
  }

  public async cancelCurrentSubscriptionForAdmin(
    lawyerId:
      string,
  ) {
    const session =
      await mongoose
        .startSession();

    try {
      const subscription =
        await session
          .withTransaction(
            async () => {
              const lawyer =
                await this
                  .lawyerRepository
                  .acquireSubscriptionWriteGuard(
                    lawyerId,
                    session,
                  );

              if (
                !lawyer
              ) {
                throw new HttpException(
                  404,

                  MESSAGES
                    .noUserWithId[
                      LANGUAGE
                    ],

                  "LAWYER_NOT_FOUND",
                );
              }

              const subscription =
                await this.repository
                  .cancelCurrentByLawyerId(
                    lawyerId,
                    new Date(),
                    session,
                  );

              if (
                !subscription
              ) {
                throw new HttpException(
                  404,

                  MESSAGES
                    .lawyerSubscriptionNotFound[
                      LANGUAGE
                    ],

                  "LAWYER_SUBSCRIPTION_NOT_FOUND",
                );
              }

              return subscription;
            },
          );

      if (
        !subscription
      ) {
        throw new HttpException(
          500,

          MESSAGES
            .serverError[
              LANGUAGE
            ],

          "LAWYER_SUBSCRIPTION_CANCEL_FAILED",
        );
      }

      return toLawyerSubscriptionDTO(
        subscription,
      );
    } finally {
      await session
        .endSession();
    }
  }
}