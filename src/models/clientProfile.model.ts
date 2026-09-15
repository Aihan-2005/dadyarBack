import { model, Schema } from "mongoose";

export const ClientProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
      unique: true,
      index: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
  },
  {
    timestamps: true,
  },
);

export const ClientProfileModel = model(
  "ClientProfile",
  ClientProfileSchema,
  "clientprofiles",
);

export default ClientProfileModel;
