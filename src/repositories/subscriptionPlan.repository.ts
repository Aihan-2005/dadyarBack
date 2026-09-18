import type {
  CreateSubscriptionPlanInput,
  SubscriptionPlan,
  UpdateSubscriptionPlanInput,
} from "../interfaces/subscriptionPlan.interface";

import { SubscriptionPlanModel } from "../models/subscriptionPlan.model";

import { BaseRepository } from "./base.repository";

export class SubscriptionPlanRepository extends BaseRepository<SubscriptionPlan> {
  constructor() {
    super(SubscriptionPlanModel);
  }

  public findPublicPlans() {
    return this.model
      .find({
        isActive: true,
      })
      .sort({
        sortOrder: 1,

        price: 1,
      })
      .lean()
      .exec();
  }

  public findPublicPlanById(id: string) {
    return this.model
      .findOne({
        _id: this.toObjectId(id),

        isActive: true,
      })
      .lean()
      .exec();
  }

  public findAllForAdmin() {
    return this.model
      .find()
      .sort({
        sortOrder: 1,

        createdAt: -1,
      })
      .lean()
      .exec();
  }

  public findById(id: string) {
    return this.model.findById(this.toObjectId(id)).lean().exec();
  }

  public createPlan(input: CreateSubscriptionPlanInput) {
    return this.model.create(input);
  }

  public updatePlan(
    id: string,

    input: UpdateSubscriptionPlanInput,
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(id),
        },

        {
          $set: input,
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
