import type {
  ClientSession,
} from "mongoose";

import {
  DEFAULT_TRIAL_DAYS,
  SubscriptionSettingsModel,
} from "../models/subscriptionSettings.model";

export class SubscriptionSettingsRepository {
  public getOrCreate(
    session?:
      ClientSession,
  ) {
    return SubscriptionSettingsModel
      .findOneAndUpdate(
        {
          key:
            "GLOBAL",
        },

        {
          $setOnInsert: {
            key:
              "GLOBAL",

            trialDays:
              DEFAULT_TRIAL_DAYS,
          },
        },

        {
          upsert:
            true,

          returnDocument:
            "after",

          setDefaultsOnInsert:
            true,

          session,
        },
      )
      .lean()
      .exec();
  }

  public updateTrialDays(
    trialDays:
      number,

    session?:
      ClientSession,
  ) {
    return SubscriptionSettingsModel
      .findOneAndUpdate(
        {
          key:
            "GLOBAL",
        },

        {
          $set: {
            trialDays,
          },

          $setOnInsert: {
            key:
              "GLOBAL",
          },
        },

        {
          upsert:
            true,

          returnDocument:
            "after",

          runValidators:
            true,

          setDefaultsOnInsert:
            true,

          session,
        },
      )
      .lean()
      .exec();
  }
}