import mongoose from "mongoose";

import { env } from "../config/env";

import { AttachmentRepository } from "../repositories/attachment.repository";

import { S3StorageProvider } from "../providers/storage/s3Storage.provider";

import { AttachmentService } from "../services/attachment.service";

async function main() {
  await mongoose.connect(env.MONGO_URI);

  console.log("✓ Connected to MongoDB");

  const attachmentRepository = new AttachmentRepository();

  const storageProvider = new S3StorageProvider();

  const attachmentService = new AttachmentService(
    attachmentRepository,
    storageProvider,
  );

  let attachmentId: string | undefined;

  try {
    /*
     * Valid 1x1 PNG.
     */
    const pngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64",
    );

    /*
     * 1. Upload file + create Attachment document
     */
    const attachment = await attachmentService.createAttachment({
      originalName: "attachment-test.png",

      mimeType: "image/png",

      buffer: pngBuffer,
    });

    attachmentId = attachment._id.toString();

    console.log("✓ Attachment created");

    console.log({
      id: attachmentId,

      storageKey: attachment.storageKey,

      size: attachment.size,

      mimeType: attachment.mimeType,
    });

    /*
     * 2. Verify MongoDB record
     */
    const savedAttachment = await attachmentRepository.findById(attachmentId);

    if (!savedAttachment) {
      throw new Error("Attachment was not saved in MongoDB");
    }

    console.log("✓ MongoDB record exists");

    /*
     * 3. Generate presigned download URL
     */
    const downloadUrl = await attachmentService.getDownloadUrl(attachmentId);

    console.log("✓ Presigned URL generated");

    console.log(downloadUrl);

    /*
     * 4. Download directly from S3
     */
    const response = await fetch(downloadUrl);

    if (!response.ok) {
      throw new Error(
        `Signed URL download failed: ${response.status} ${response.statusText}`,
      );
    }

    const downloadedBuffer = Buffer.from(await response.arrayBuffer());

    if (downloadedBuffer.length !== pngBuffer.length) {
      throw new Error(
        `Downloaded file size mismatch. Expected ${pngBuffer.length}, got ${downloadedBuffer.length}`,
      );
    }

    console.log("✓ File downloaded successfully through signed URL");

    /*
     * 5. Delete physical object + MongoDB document
     */
    await attachmentService.deleteAttachment(attachmentId);

    console.log("✓ Attachment deleted");

    /*
     * 6. Verify MongoDB deletion
     */
    const deletedAttachment = await attachmentRepository.findById(attachmentId);

    if (deletedAttachment) {
      throw new Error("Attachment still exists in MongoDB after deletion");
    }

    console.log("✓ MongoDB record removed");

    console.log("\n✅ ATTACHMENT S3 TEST PASSED");

    attachmentId = undefined;
  } finally {
    /*
     * Cleanup if the test fails halfway through.
     */
    if (attachmentId) {
      try {
        await attachmentService.deleteAttachment(attachmentId);

        console.log("✓ Test attachment cleaned up");
      } catch (error) {
        console.error("⚠ Failed to clean up test attachment:", error);
      }
    }
  }
}

main()
  .catch((error) => {
    console.error("\n❌ ATTACHMENT S3 TEST FAILED");

    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();

    console.log("✓ MongoDB disconnected");
  });
