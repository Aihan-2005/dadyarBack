import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "../../config/env";

import type {
  GetDownloadUrlInput,
  SaveFileInput,
} from "../../interfaces/storage.interface";

import type { StorageProvider } from "./storage.provider";

export class S3StorageProvider implements StorageProvider {
  private readonly client: S3Client;

  constructor() {
    this.client = new S3Client({
      endpoint: env.S3_ENDPOINT,

      region: env.S3_REGION,

      credentials: {
        accessKeyId: env.S3_ACCESS_KEY,

        secretAccessKey: env.S3_SECRET_KEY,
      },
    });
  }

  public async save(input: SaveFileInput): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,

        Key: input.storageKey,

        Body: input.buffer,

        ContentType: input.mimeType,
      }),
    );
  }

  public async delete(storageKey: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,

        Key: storageKey,
      }),
    );
  }

  public getDownloadUrl(input: GetDownloadUrlInput): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: env.S3_BUCKET,

      Key: input.storageKey,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: input.expiresInSeconds ?? 600,
    });
  }
}
