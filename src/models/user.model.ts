import { model, Schema } from "mongoose";

import {
  DEFAULT_USER_STATUS,
  USER_ROLES,
  USER_STATUSES,
} from "../constants/user.constants";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";

export const UserSchema = new Schema(
  {
    email: {
      type: String,

      unique: true,

      lowercase: true,

      trim: true,

      sparse: true,
    },

    phone: {
      type: String,

      match: /^09\d{9}$/,

      unique: true,

      trim: true,

      sparse: true,
    },

    password: {
      type: String,

      required: true,

      select: false,
    },

    role: {
      type: String,

      enum: Object.values(USER_ROLES),

      required: true,

      immutable: true,

      index: true,
    },

    status: {
      type: String,

      enum: Object.values(USER_STATUSES),

      required: true,

      default: DEFAULT_USER_STATUS,

      index: true,
    },

    emailVerifiedAt: {
      type: Date,

      default: null,
    },

    phoneVerifiedAt: {
      type: Date,

      default: null,
    },

    lastLoginAt: {
      type: Date,

      default: null,
    },
  },

  {
    timestamps: true,
  },
);

UserSchema.pre(
  "validate",

  function () {
    if (!this.email && !this.phone) {
      throw new Error(MESSAGES.noEmailNorPhone[env.LANGUAGE]);
    }
  },
);

export const UserModel = model("User", UserSchema);
