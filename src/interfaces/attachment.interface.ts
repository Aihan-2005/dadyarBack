import type { InferSchemaType } from "mongoose";

import type { z } from "zod";

import { AttachmentSchema } from "../models/attachment.model";

import {
  CreateAttachmentSchema,
  UploadAttachmentSchema,
} from "../validators/attachment.validator";

export type Attachment = InferSchemaType<typeof AttachmentSchema> & {
  createdAt: Date;

  updatedAt: Date;
};

export type CreateAttachmentData = z.infer<typeof CreateAttachmentSchema>;

export type UploadAttachmentInput = z.infer<typeof UploadAttachmentSchema>;
