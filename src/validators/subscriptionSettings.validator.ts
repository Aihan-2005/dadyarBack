import {
  z,
} from "zod";

import {
  MAX_TRIAL_DAYS,
} from "../models/subscriptionSettings.model";

export const UpdateSubscriptionSettingsSchema =
  z
    .object({
      trialDays:
        z
          .number()
          .int()
          .min(
            1,
          )
          .max(
            MAX_TRIAL_DAYS,
          ),
    })
    .strict();