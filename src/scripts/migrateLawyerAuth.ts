import mongoose, { Types } from "mongoose";

import { Database } from "../config/db";

import { UserModel } from "../models/user.model";

type LegacyLawyer = {
  _id: Types.ObjectId;

  email?: string | null;

  phone?: string | null;

  password?: string | null;

  role?: string | null;

  status?: string | null;

  emailVerifiedAt?: Date | null;

  phoneVerifiedAt?: Date | null;

  lastLoginAt?: Date | null;

  createdAt?: Date;

  updatedAt?: Date;
};

type MigratedUser = {
  _id: Types.ObjectId;

  email?: string | null;

  phone?: string | null;

  password: string;

  role: "LAWYER";

  status: "ACTIVE" | "SUSPENDED";

  emailVerifiedAt: Date | null;

  phoneVerifiedAt: Date | null;

  lastLoginAt: Date | null;

  createdAt: Date;

  updatedAt: Date;
};

const LEGACY_AUTH_QUERY = {
  $or: [
    {
      email: {
        $exists: true,
      },
    },
    {
      phone: {
        $exists: true,
      },
    },
    {
      password: {
        $exists: true,
      },
    },
    {
      role: {
        $exists: true,
      },
    },
    {
      emailVerifiedAt: {
        $exists: true,
      },
    },
    {
      phoneVerifiedAt: {
        $exists: true,
      },
    },
    {
      lastLoginAt: {
        $exists: true,
      },
    },
  ],
};

function normalizeEmail(email?: string | null): string | undefined {
  return email?.trim().toLowerCase() || undefined;
}

function normalizePhone(phone?: string | null): string | undefined {
  return phone?.trim() || undefined;
}

function getUserStatus(lawyerStatus?: string | null): MigratedUser["status"] {
  return lawyerStatus === "SUSPENDED" ? "SUSPENDED" : "ACTIVE";
}

async function preflight(): Promise<number> {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("DATABASE_NOT_CONNECTED");
  }

  const lawyers = db.collection<LegacyLawyer>("lawyers");

  const users = db.collection<MigratedUser>("users");

  let count = 0;

  const cursor = lawyers.find(LEGACY_AUTH_QUERY);

  for await (const lawyer of cursor) {
    count += 1;

    const email = normalizeEmail(lawyer.email);

    const phone = normalizePhone(lawyer.phone);

    const existingUser = await users.findOne({
      _id: lawyer._id,
    });

    /*
     * If a matching User already exists, this may
     * simply be a partially completed/re-run
     * migration.
     */
    if (existingUser) {
      if (existingUser.role !== "LAWYER") {
        throw new Error(`USER_ROLE_CONFLICT:${lawyer._id.toString()}`);
      }

      if (email && existingUser.email && existingUser.email !== email) {
        throw new Error(`USER_EMAIL_MISMATCH:${lawyer._id.toString()}`);
      }

      if (phone && existingUser.phone && existingUser.phone !== phone) {
        throw new Error(`USER_PHONE_MISMATCH:${lawyer._id.toString()}`);
      }

      continue;
    }

    /*
     * Creating a User requires an existing hashed
     * authentication password.
     */
    if (!lawyer.password || lawyer.password.trim() === "") {
      throw new Error(`LAWYER_PASSWORD_MISSING:${lawyer._id.toString()}`);
    }

    if (!email && !phone) {
      throw new Error(`LAWYER_IDENTIFIER_MISSING:${lawyer._id.toString()}`);
    }

    if (lawyer.role && lawyer.role !== "LAWYER") {
      throw new Error(`LAWYER_ROLE_INVALID:${lawyer._id.toString()}`);
    }

    if (email) {
      const emailOwner = await users.findOne({
        email,

        _id: {
          $ne: lawyer._id,
        },
      });

      if (emailOwner) {
        throw new Error(`USER_EMAIL_CONFLICT:${email}`);
      }
    }

    if (phone) {
      const phoneOwner = await users.findOne({
        phone,

        _id: {
          $ne: lawyer._id,
        },
      });

      if (phoneOwner) {
        throw new Error(`USER_PHONE_CONFLICT:${phone}`);
      }
    }
  }

  return count;
}

async function migrate(): Promise<{
  migrated: number;

  cleaned: number;
}> {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("DATABASE_NOT_CONNECTED");
  }

  const lawyers = db.collection<LegacyLawyer>("lawyers");

  const users = db.collection<MigratedUser>("users");

  let migrated = 0;

  let cleaned = 0;

  const cursor = lawyers.find(LEGACY_AUTH_QUERY);

  for await (const lawyer of cursor) {
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const existingUser = await users.findOne(
          {
            _id: lawyer._id,
          },
          {
            session,
          },
        );

        if (!existingUser) {
          const now = new Date();

          const email = normalizeEmail(lawyer.email);

          const phone = normalizePhone(lawyer.phone);

          if (!lawyer.password) {
            throw new Error(`LAWYER_PASSWORD_MISSING:${lawyer._id.toString()}`);
          }

          const user: MigratedUser = {
            _id: lawyer._id,

            password: lawyer.password,

            role: "LAWYER",

            status: getUserStatus(lawyer.status),

            emailVerifiedAt: lawyer.emailVerifiedAt ?? null,

            phoneVerifiedAt: lawyer.phoneVerifiedAt ?? null,

            lastLoginAt: lawyer.lastLoginAt ?? null,

            createdAt: lawyer.createdAt ?? now,

            updatedAt: lawyer.updatedAt ?? now,
          };

          if (email) {
            user.email = email;
          }

          if (phone) {
            user.phone = phone;
          }

          await users.insertOne(user, {
            session,
          });

          migrated += 1;
        }

        /*
         * Only remove legacy auth fields AFTER
         * the User document exists.
         *
         * Lawyer.status and licenseVerifiedAt
         * intentionally remain on Lawyer.
         */
        await lawyers.updateOne(
          {
            _id: lawyer._id,
          },
          {
            $unset: {
              email: "",

              phone: "",

              password: "",

              role: "",

              emailVerifiedAt: "",

              phoneVerifiedAt: "",

              lastLoginAt: "",
            },
          },
          {
            session,
          },
        );

        cleaned += 1;
      });
    } finally {
      await session.endSession();
    }
  }

  return {
    migrated,
    cleaned,
  };
}

async function main(): Promise<void> {
  const database = new Database();

  try {
    await database.connect();

    const candidates = await preflight();

    console.log(
      `Lawyer auth migration preflight passed for ${candidates} lawyer(s)`,
    );

    const result = await migrate();

    /*
     * Explicitly ensure the new User indexes exist
     * after the data has been migrated.
     */
    await UserModel.createIndexes();

    console.log("Lawyer auth migration completed successfully", result);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await database.disconnect();
    }
  }
}

void main().catch((error: unknown) => {
  console.error("Lawyer auth migration failed:", error);

  process.exitCode = 1;
});
