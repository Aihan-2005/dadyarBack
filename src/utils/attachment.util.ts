import type { UploadAttachmentInput } from "../interfaces/attachment.interface";

export function toUploadAttachmentInput(
  file: Express.Multer.File,
): UploadAttachmentInput {
  return {
    originalName: file.originalname,

    mimeType: file.mimetype,

    buffer: file.buffer,
  };
}
