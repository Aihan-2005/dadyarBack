import { Schema, model, Types } from "mongoose";

export const RefreshTokenSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "Lawyer",
      required: true,
      index: true,
    },
    jti: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshTokenModel = model("RefreshToken", RefreshTokenSchema);
