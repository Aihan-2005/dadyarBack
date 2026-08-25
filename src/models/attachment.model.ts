import { model, Schema } from "mongoose";

import { ATTACHMENT_EXTENSIONS } from "../constants/attachment.constants";

export const AttachmentSchema = new Schema(
  {
    originalName: {
      type: String,

      required: true,

      trim: true,
    },

    storageKey: {
      type: String,

      required: true,

      unique: true,

      immutable: true,
    },

    mimeType: {
      type: String,

      required: true,

      trim: true,
    },

    extension: {
      type: String,

      enum: ATTACHMENT_EXTENSIONS,

      required: true,

      immutable: true,
    },

    size: {
      type: Number,

      required: true,

      min: 1,

      immutable: true,
    },
  },
  {
    timestamps: true,
  },
);

export const AttachmentModel = model("Attachment", AttachmentSchema);
