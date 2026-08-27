import { randomUUID } from "node:crypto";

import * as path from "node:path";

import type { ClientSession } from "mongoose";

import type {
  CreateAttachmentData,
  UploadAttachmentInput,
} from "../interfaces/attachment.interface";

import { AttachmentRepository } from "../repositories/attachment.repository";

import { S3StorageProvider } from "../providers/storage/s3Storage.provider";

import type { StorageProvider } from "../providers/storage/storage.provider";

import {
  AttachmentExtensionSchema,
  CreateAttachmentSchema,
  UploadAttachmentSchema,
} from "../validators/attachment.validator";

import { ATTACHMENT_MIME_TYPES } from "../constants/attachment.constants";

import { HttpException } from "../exceptions/httpException";

import { MESSAGES } from "../constants/messages.constants";

import { env } from "../config/env";

const LANGUAGE = env.LANGUAGE;

export class AttachmentService {
  constructor(
    private readonly attachmentRepository = new AttachmentRepository(),
    private readonly storageProvider: StorageProvider = new S3StorageProvider(),
  ) {}

  public async createAttachment(input: UploadAttachmentInput) {
    const createData = await this.uploadAttachment(input);

    try {
      return await this.createAttachmentRecord(createData);
    } catch (error) {
      await this.deleteStoredAttachment(createData.storageKey).catch(
        () => undefined,
      );

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

  public async getDownloadUrl(attachmentId: string) {
    const attachment = await this.attachmentRepository.findById(attachmentId);

    if (!attachment) {
      throw new HttpException(
        404,
        MESSAGES.attachmentNotFound[LANGUAGE],
        "ATTACHMENT_NOT_FOUND",
      );
    }

    return this.storageProvider.getDownloadUrl({
      storageKey: attachment.storageKey,

      expiresInSeconds: 600,
    });
  }

  public async uploadAttachment(input: UploadAttachmentInput) {
    const file = UploadAttachmentSchema.parse(input);

    const extension = path.extname(file.originalName).slice(1).toLowerCase();

    const validExtension = AttachmentExtensionSchema.parse(extension);

    const allowedMimeTypes = ATTACHMENT_MIME_TYPES[
      validExtension
    ] as readonly string[];

    if (!allowedMimeTypes.includes(file.mimeType)) {
      throw new HttpException(
        400,
        MESSAGES.invalidAttachmentType[LANGUAGE],
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

      mimeType: file.mimeType,
    });

    return createData;
  }

  public createAttachmentRecord(
    data: CreateAttachmentData,
    session?: ClientSession,
  ) {
    return this.attachmentRepository.create(data, session);
  }

  public deleteStoredAttachment(storageKey: string) {
    return this.storageProvider.delete(storageKey);
  }
}
