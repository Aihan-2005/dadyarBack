import { Buffer } from "node:buffer";

import { z } from "zod";

import {
  ATTACHMENT_EXTENSIONS,
  ATTACHMENT_MAX_SIZE,
} from "../constants/attachment.constants";
import { RequiredString } from "./common.validator";

const AttachmentSizeSchema = z
  .number()
  .int()
  .positive()
  .max(ATTACHMENT_MAX_SIZE);

export const AttachmentExtensionSchema = z.enum(ATTACHMENT_EXTENSIONS);

export const UploadAttachmentSchema = z.object({
  originalName: RequiredString.max(255),

  mimeType: RequiredString.max(255),

  buffer: z
    .instanceof(Buffer)
    .refine((buffer) => buffer.length > 0, {
      message: "Attachment cannot be empty",
    })
    .refine((buffer) => buffer.length <= ATTACHMENT_MAX_SIZE, {
      message: "Attachment exceeds maximum size",
    }),
});

export const CreateAttachmentSchema = z.object({
  originalName: RequiredString.max(255),

  storageKey: RequiredString,

  mimeType: RequiredString.max(255),

  extension: AttachmentExtensionSchema,

  size: AttachmentSizeSchema,
});
