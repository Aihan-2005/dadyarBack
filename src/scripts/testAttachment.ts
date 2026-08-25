import { access } from "node:fs/promises";

import * as path from "node:path";

import mongoose from "mongoose";

import { env } from "../config/env";

import { AttachmentRepository } from "../repositories/attachment.repository";

import { LocalStorageProvider } from "../providers/storage/localStorage.provider";

import { AttachmentService } from "../services/attachment.service";

async function main() {
  await mongoose.connect(env.MONGO_URI);

  const repository = new AttachmentRepository();

  const storageProvider = new LocalStorageProvider();

  const service = new AttachmentService(repository, storageProvider);

  const pngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  );

  const oversizedBuffer = Buffer.alloc(2 * 1024 * 1024 + 1);

  const attachment = await service.createAttachment({
    originalName: "test.png",

    mimeType: "image/png",

    buffer: pngBuffer,
  });

  console.log("Created attachment:", attachment);

  const attachmentId = attachment._id.toString();

  const filePath = path.resolve(env.STORAGE_ROOT, attachment.storageKey);

  await access(filePath);

  console.log("Physical file exists:", filePath);

  const savedAttachment = await repository.findById(attachmentId);

  if (!savedAttachment) {
    throw new Error("Attachment was not saved in MongoDB");
  }

  console.log("MongoDB record exists");

  await service.deleteAttachment(attachmentId);

  const deletedAttachment = await repository.findById(attachmentId);

  if (deletedAttachment) {
    throw new Error("Attachment MongoDB record was not deleted");
  }

  try {
    await access(filePath);

    throw new Error("Physical file was not deleted");
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Physical file was not deleted"
    ) {
      throw error;
    }
  }

  console.log("Attachment deletion works");

  console.log("✅ Attachment smoke test passed");
}

main()
  .catch((error) => {
    console.error("❌ Attachment smoke test failed", error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
