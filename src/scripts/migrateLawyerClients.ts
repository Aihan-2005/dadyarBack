import mongoose from "mongoose";

import { Database } from "../config/db";

const SOURCE_COLLECTION = "clients";

const TARGET_COLLECTION = "lawyerclients";

async function collectionExists(name: string): Promise<boolean> {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("DATABASE_NOT_CONNECTED");
  }

  const collections = await db
    .listCollections(
      {
        name,
      },
      {
        nameOnly: true,
      },
    )
    .toArray();

  return collections.length > 0;
}

async function migrate(): Promise<
  "RENAMED" | "RENAMED_AFTER_EMPTY_TARGET" | "ALREADY_MIGRATED" | "EMPTY"
> {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("DATABASE_NOT_CONNECTED");
  }

  const sourceExists = await collectionExists(SOURCE_COLLECTION);

  const targetExists = await collectionExists(TARGET_COLLECTION);

  if (sourceExists && !targetExists) {
    await db.collection(SOURCE_COLLECTION).rename(TARGET_COLLECTION);

    return "RENAMED";
  }

  if (!sourceExists && targetExists) {
    return "ALREADY_MIGRATED";
  }

  if (!sourceExists && !targetExists) {
    return "EMPTY";
  }

  /*
   * Both collections exist.
   *
   * This commonly happens because Mongoose
   * auto-created an empty lawyerclients
   * collection before the migration ran.
   */
  const [sourceCount, targetCount] = await Promise.all([
    db.collection(SOURCE_COLLECTION).countDocuments(),

    db.collection(TARGET_COLLECTION).countDocuments(),
  ]);

  console.log("Both client collections exist:", {
    clients: sourceCount,

    lawyerclients: targetCount,
  });

  /*
   * Expected migration situation:
   *
   * clients contains the real old data,
   * lawyerclients was auto-created empty.
   */
  if (sourceCount > 0 && targetCount === 0) {
    await db.collection(TARGET_COLLECTION).drop();

    await db.collection(SOURCE_COLLECTION).rename(TARGET_COLLECTION);

    return "RENAMED_AFTER_EMPTY_TARGET";
  }

  /*
   * Migration already happened, but an empty
   * legacy clients collection somehow exists.
   */
  if (sourceCount === 0 && targetCount > 0) {
    await db.collection(SOURCE_COLLECTION).drop();

    return "ALREADY_MIGRATED";
  }

  /*
   * Both are empty. There's no data to preserve.
   */
  if (sourceCount === 0 && targetCount === 0) {
    await db.collection(SOURCE_COLLECTION).drop();

    return "EMPTY";
  }

  /*
   * Both contain real data.
   *
   * Do NOT guess how to merge them.
   */
  throw new Error(
    `CLIENT_COLLECTION_CONFLICT: clients=${sourceCount}, lawyerclients=${targetCount}`,
  );
}

async function main(): Promise<void> {
  const database = new Database();

  try {
    await database.connect();

    const result = await migrate();

    console.log(`LawyerClient collection migration: ${result}`);

    /*
     * Import only AFTER the collection has been
     * renamed so Mongoose cannot pre-create the
     * target collection before migration.
     */
    const { LawyerClientModel } = await import("../models/lawyerClient.model");

    await LawyerClientModel.createIndexes();

    console.log("LawyerClient indexes created successfully");
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await database.disconnect();
    }
  }
}

void main().catch((error: unknown) => {
  console.error("LawyerClient migration failed:", error);

  process.exitCode = 1;
});
