import { randomUUID } from "node:crypto";

import * as path from "node:path";

import type { UploadAttachmentInput } from "../interfaces/attachment.interface";

import { AttachmentRepository } from "../repositories/attachment.repository";

import { LocalStorageProvider } from "../providers/storage/localStorage.provider";

import type { StorageProvider } from "../providers/storage/storage.provider";

import {
  AttachmentExtensionSchema,
  CreateAttachmentSchema,
  UploadAttachmentSchema,
} from "../validators/attachment.validator";
import { ATTACHMENT_MIME_TYPES } from "../constants/attachment.constants";
import { HttpException } from "../exceptions/httpException";

export class AttachmentService {
  constructor(
    private readonly attachmentRepository = new AttachmentRepository(),
    private readonly storageProvider: StorageProvider = new LocalStorageProvider(),
  ) {}

  public async createAttachment(input: UploadAttachmentInput) {
    const file = UploadAttachmentSchema.parse(input);

    const extension = path.extname(file.originalName).slice(1).toLowerCase();

    const validExtension = AttachmentExtensionSchema.parse(extension);

    const allowedMimeTypes = ATTACHMENT_MIME_TYPES[
      validExtension
    ] as readonly string[];

    if (!allowedMimeTypes.includes(file.mimeType)) {
      throw new HttpException(
        400,
        "Invalid attachment type",
        "INVALID_ATTACHMENT_TYPE",
      );
    }

    const storageKey = `attachments/${randomUUID()}.${validExtension}`;

    const createData = CreateAttachmentSchema.parse({
      originalName: file.originalName,

      storageKey,

      mimeType: file.mimeType,

      extension: validExtension,

      size: file.buffer.length,
    });

    await this.storageProvider.save({
      storageKey,

      buffer: file.buffer,
    });

    try {
      return await this.attachmentRepository.create(createData);
    } catch (error) {
      await this.storageProvider.delete(storageKey).catch(() => undefined);

      throw error;
    }
  }

  public async deleteAttachment(attachmentId: string) {
    const attachment = await this.attachmentRepository.findById(attachmentId);

    if (!attachment) {
      return;
    }

    await this.storageProvider.delete(attachment.storageKey);

    return this.attachmentRepository.deleteById(attachmentId);
  }
}
