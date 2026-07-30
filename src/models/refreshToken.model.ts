import {
  model,
  Schema,
} from "mongoose";

import type {
  RefreshToken,
} from "../interfaces/token.interface";

export const RefreshTokenSchema =
  new Schema<RefreshToken>(
    {
      userId: {
        type:
          Schema.Types.ObjectId,

        ref: "Lawyer",

        required: true,

        index: true,
      },

      jti: {
        type: String,

        required: true,

        unique: true,
      },

      expiresAt: {
        type: Date,

        required: true,
      },
    },
    {
      timestamps: true,

      versionKey: false,
    },
  );

RefreshTokenSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  },
);

export const RefreshTokenModel =
  model<RefreshToken>(
    "RefreshToken",
    RefreshTokenSchema,
  );