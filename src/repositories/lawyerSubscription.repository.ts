import type {
  CreateLawyerSubscriptionData,
  LawyerSubscription,
} from "../interfaces/lawyerSubscription.interface";

import { LawyerSubscriptionModel } from "../models/lawyerSubscription.model";

import { BaseRepository } from "./base.repository";

export class LawyerSubscriptionRepository extends BaseRepository<LawyerSubscription> {
  constructor() {
    super(LawyerSubscriptionModel);
  }

  public async createSubscription(input: CreateLawyerSubscriptionData) {
    return this.model.create(input);
  }

  public findCurrentByLawyerId(
    lawyerId: string,

    now = new Date(),
  ) {
    return this.model
      .findOne({
        lawyerId: this.toObjectId(lawyerId),

        cancelledAt: null,

        startsAt: {
          $lte: now,
        },

        endsAt: {
          $gt: now,
        },
      })
      .lean()
      .exec();
  }

  public findHistoryByLawyerId(lawyerId: string) {
    return this.model
      .find({
        lawyerId: this.toObjectId(lawyerId),
      })
      .sort({
        createdAt: -1,
      })
      .lean()
      .exec();
  }

  public cancelCurrentByLawyerId(
    lawyerId: string,

    cancelledAt = new Date(),
  ) {
    return this.model
      .findOneAndUpdate(
        {
          lawyerId: this.toObjectId(lawyerId),

          cancelledAt: null,

          startsAt: {
            $lte: cancelledAt,
          },

          endsAt: {
            $gt: cancelledAt,
          },
        },

        {
          $set: {
            cancelledAt,
          },
        },

        {
          new: true,

          runValidators: true,
        },
      )
      .lean()
      .exec();
  }
}
