import type { ClientSession } from "mongoose";
import type {
  CreateLawyerSubscriptionData,
  LawyerSubscription,
  LawyerSubscriptionHistoryOptions,
} from "../interfaces/lawyerSubscription.interface";

import { LawyerSubscriptionModel } from "../models/lawyerSubscription.model";

import { BaseRepository } from "./base.repository";

export class LawyerSubscriptionRepository extends BaseRepository<LawyerSubscription> {
  constructor() {
    super(LawyerSubscriptionModel);
  }

  public async createSubscription(
    input: CreateLawyerSubscriptionData,
    session?: ClientSession,
  ) {
    if (!session) {
      const subscription = await this.model.create(input);

      return subscription.toObject();
    }

    const [subscription] = await this.model.create([input], { session });

    return subscription.toObject();
  }

  public findCurrentByLawyerId(
    lawyerId: string,
    now = new Date(),
    session?: ClientSession,
  ) {
    const query = this.model.findOne({
      lawyerId: this.toObjectId(lawyerId),
      cancelledAt: null,

      startsAt: {
        $lte: now,
      },

      endsAt: {
        $gt: now,
      },
    });

    if (session) {
      query.session(session);
    }

    return query.lean().exec();
  }

  public async findHistoryByLawyerId(
    lawyerId: string,
    options: LawyerSubscriptionHistoryOptions,
  ) {
    const filter = {
      lawyerId: this.toObjectId(lawyerId),
    };

    const skip = (options.page - 1) * options.limit;

    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(options.limit)
        .lean()
        .exec(),

      this.model.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
    };
  }

  public cancelCurrentByLawyerId(
    lawyerId: string,

    cancelledAt = new Date(),

    session?: ClientSession,
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
          returnDocument: "after",

          runValidators: true,

          session,
        },
      )
      .lean()
      .exec();
  }
}
