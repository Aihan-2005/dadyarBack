import type { SaveOtpInput, StoredOtp } from "../../interfaces/otp.interface";

import type { OtpStore } from "./otp.store";

export class InMemoryOtpStore implements OtpStore {
  private readonly store = new Map<string, StoredOtp>();

  private isExpired(entry: StoredOtp): boolean {
    return entry.expiresAt <= Date.now();
  }

  private getValidEntry(key: string): StoredOtp | null {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.store.delete(key);

      return null;
    }

    return entry;
  }

  public async set(
    key: string,
    input: SaveOtpInput,
    ttlSeconds: number,
  ): Promise<StoredOtp> {
    if (ttlSeconds <= 0) {
      throw new Error("OTP TTL must be greater than zero");
    }

    const now = Date.now();

    const entry: StoredOtp = {
      codeHash: input.codeHash,

      attempts: input.attempts ?? 0,

      createdAt: now,

      expiresAt: now + ttlSeconds * 1000,
    };

    this.store.set(key, entry);

    return {
      ...entry,
    };
  }

  public async get(key: string): Promise<StoredOtp | null> {
    const entry = this.getValidEntry(key);

    return entry ? { ...entry } : null;
  }

  public async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  public async exists(key: string): Promise<boolean> {
    return this.getValidEntry(key) !== null;
  }

  public async incrementAttempts(key: string): Promise<number | null> {
    const entry = this.getValidEntry(key);

    if (!entry) {
      return null;
    }

    entry.attempts += 1;

    return entry.attempts;
  }

  public async consume(
    key: string,
    expectedCodeHash: string,
  ): Promise<StoredOtp | null> {
    const entry = this.getValidEntry(key);

    if (!entry) {
      return null;
    }

    if (entry.codeHash !== expectedCodeHash) {
      return null;
    }

    this.store.delete(key);

    return {
      ...entry,
    };
  }
}
