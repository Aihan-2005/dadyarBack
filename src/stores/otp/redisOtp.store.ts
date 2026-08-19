import type { SaveOtpInput, StoredOtp } from "../../interfaces/otp.interface";

import { RedisDatabase } from "../../config/redis";

import type { OtpStore } from "./otp.store";

const INCREMENT_ATTEMPTS_SCRIPT = `
  if redis.call("EXISTS", KEYS[1]) == 0 then
    return -1
  end

  return redis.call(
    "HINCRBY",
    KEYS[1],
    "attempts",
    1
  )
`;

const CONSUME_OTP_SCRIPT = `
  local currentHash =
    redis.call(
      "HGET",
      KEYS[1],
      "codeHash"
    )

  if not currentHash then
    return nil
  end

  if currentHash ~= ARGV[1] then
    return nil
  end

  local record =
    redis.call(
      "HMGET",
      KEYS[1],
      "codeHash",
      "attempts",
      "createdAt",
      "expiresAt"
    )

  redis.call(
    "DEL",
    KEYS[1]
  )

  return record
`;

export class RedisOtpStore implements OtpStore {
  constructor(private readonly redisDatabase: RedisDatabase) {}

  private parseStoredOtp(data: Record<string, string>): StoredOtp {
    const { codeHash, attempts, createdAt, expiresAt } = data;

    if (
      !codeHash ||
      attempts === undefined ||
      createdAt === undefined ||
      expiresAt === undefined
    ) {
      throw new Error("Invalid OTP record stored in Redis");
    }

    const parsedAttempts = Number(attempts);

    const parsedCreatedAt = Number(createdAt);

    const parsedExpiresAt = Number(expiresAt);

    if (
      !Number.isInteger(parsedAttempts) ||
      !Number.isFinite(parsedCreatedAt) ||
      !Number.isFinite(parsedExpiresAt)
    ) {
      throw new Error("Invalid OTP record stored in Redis");
    }

    return {
      codeHash,

      attempts: parsedAttempts,

      createdAt: parsedCreatedAt,

      expiresAt: parsedExpiresAt,
    };
  }

  private parseConsumedOtp(value: unknown): StoredOtp | null {
    if (value === null) {
      return null;
    }

    if (!Array.isArray(value) || value.length !== 4) {
      throw new Error("Unexpected Redis OTP consume response");
    }

    const [codeHash, attempts, createdAt, expiresAt] = value;

    if (
      typeof codeHash !== "string" ||
      typeof attempts !== "string" ||
      typeof createdAt !== "string" ||
      typeof expiresAt !== "string"
    ) {
      throw new Error("Invalid OTP record stored in Redis");
    }

    return this.parseStoredOtp({
      codeHash,
      attempts,
      createdAt,
      expiresAt,
    });
  }

  public async set(
    key: string,
    input: SaveOtpInput,
    ttlSeconds: number,
  ): Promise<StoredOtp> {
    if (ttlSeconds <= 0) {
      throw new Error("OTP TTL must be greater than zero");
    }

    const client = await this.redisDatabase.getClient();

    const now = Date.now();

    const entry: StoredOtp = {
      codeHash: input.codeHash,

      attempts: input.attempts ?? 0,

      createdAt: now,

      expiresAt: now + ttlSeconds * 1000,
    };

    await client
      .multi()
      .hSet(key, {
        codeHash: entry.codeHash,

        attempts: String(entry.attempts),

        createdAt: String(entry.createdAt),

        expiresAt: String(entry.expiresAt),
      })
      .expire(key, ttlSeconds)
      .exec();

    return entry;
  }

  public async get(key: string): Promise<StoredOtp | null> {
    const client = await this.redisDatabase.getClient();

    const data = await client.hGetAll(key);

    if (Object.keys(data).length === 0) {
      return null;
    }

    return this.parseStoredOtp(data);
  }

  public async delete(key: string): Promise<void> {
    const client = await this.redisDatabase.getClient();

    await client.del(key);
  }

  public async exists(key: string): Promise<boolean> {
    const client = await this.redisDatabase.getClient();

    const count = await client.exists(key);

    return count === 1;
  }

  public async incrementAttempts(key: string): Promise<number | null> {
    const client = await this.redisDatabase.getClient();

    const result = await client.eval(INCREMENT_ATTEMPTS_SCRIPT, {
      keys: [key],
    });

    if (result === -1) {
      return null;
    }

    if (typeof result !== "number") {
      throw new Error("Unexpected Redis OTP attempt response");
    }

    return result;
  }

  public async consume(
    key: string,
    expectedCodeHash: string,
  ): Promise<StoredOtp | null> {
    const client = await this.redisDatabase.getClient();

    const result = await client.eval(CONSUME_OTP_SCRIPT, {
      keys: [key],

      arguments: [expectedCodeHash],
    });

    return this.parseConsumedOtp(result);
  }
}
