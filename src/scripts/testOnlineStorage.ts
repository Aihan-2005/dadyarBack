import dotenv from "dotenv";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

console.log({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  accessKeyId: process.env.S3_ACCESS_KEY!,
  secretAccessKey: process.env.S3_SECRET_KEY!,
  Bucket: process.env.S3_BUCKET!,
});

const client = new S3Client({
  endpoint: process.env.S3_ENDPOINT!,

  region: process.env.S3_REGION!,

  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,

    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

async function test() {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET!,

    Key: "25.pdf",
  });

  const url = await getSignedUrl(client, command, {
    expiresIn: 300,
  });

  console.log(url);
}

test();
