import { RedisDatabase } from "../../config/redis";

import type { OtpCooldownStore } from "./otpCooldown.store";

export class RedisOtpCooldownStore implements OtpCooldownStore {
  constructor(private readonly redisDatabase: RedisDatabase) {}

  public async tryAcquire(key: string, ttlSeconds: number): Promise<boolean> {
    if (ttlSeconds <= 0) {
      throw new Error("OTP cooldown TTL must be greater than zero");
    }

    const client = await this.redisDatabase.getClient();

    const result = await client.set(key, "1", {
      EX: ttlSeconds,
      NX: true,
    });

    return result === "OK";
  }

  public async getRemainingSeconds(key: string): Promise<number> {
    const client = await this.redisDatabase.getClient();

    const remainingMs = await client.pTTL(key);

    if (remainingMs === -2) {
      return 0;
    }

    if (remainingMs === -1) {
      throw new Error("OTP cooldown key has no expiration");
    }

    return Math.ceil(remainingMs / 1000);
  }

  public async release(key: string): Promise<void> {
    const client = await this.redisDatabase.getClient();

    await client.del(key);
  }
}
