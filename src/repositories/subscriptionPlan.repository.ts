import type {
  ClientSession,
} from "mongoose";

import type {
  CreateSubscriptionPlanInput,
  SubscriptionPlan,
  UpdateSubscriptionPlanInput,
} from "../interfaces/subscriptionPlan.interface";

import {
  SubscriptionPlanModel,
} from "../models/subscriptionPlan.model";

import {
  BaseRepository,
} from "./base.repository";

export class SubscriptionPlanRepository extends BaseRepository<SubscriptionPlan> {
  constructor() {
    super(
      SubscriptionPlanModel,
    );
  }

  public findPublicPlans() {
    return this.model
      .find({
        isActive:
          true,
      })
      .sort({
        sortOrder:
          1,

        price:
          1,
      })
      .lean()
      .exec();
  }

  public findPublicPlanById(
    id:
      string,

    session?:
      ClientSession,
  ) {
    const query =
      this.model.findOne({
        _id:
          this.toObjectId(
            id,
          ),

        isActive:
          true,
      });

    if (
      session
    ) {
      query.session(
        session,
      );
    }

    return query
      .lean()
      .exec();
  }

  public findAllForAdmin() {
    return this.model
      .find()
      .sort({
        sortOrder:
          1,

        createdAt:
          -1,
      })
      .lean()
      .exec();
  }

  public findById(
    id:
      string,
  ) {
    return this.model
      .findById(
        this.toObjectId(
          id,
        ),
      )
      .lean()
      .exec();
  }

  public async createPlan(
    input:
      CreateSubscriptionPlanInput,
  ) {
    const plan =
      await this.model.create(
        input,
      );

    return plan.toObject();
  }

  public updatePlan(
    id:
      string,

    input:
      UpdateSubscriptionPlanInput,
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id:
            this.toObjectId(
              id,
            ),
        },

        {
          $set:
            input,
        },

        {
          returnDocument:
            "after",

          runValidators:
            true,
        },
      )
      .lean()
      .exec();
  }
}