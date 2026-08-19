import type { OtpCooldownStore } from "./otpCooldown.store";

export class InMemoryOtpCooldownStore implements OtpCooldownStore {
  private readonly store = new Map<string, number>();

  private getValidExpiration(key: string): number | null {
    const expiresAt = this.store.get(key);

    if (!expiresAt) {
      return null;
    }

    if (expiresAt <= Date.now()) {
      this.store.delete(key);

      return null;
    }

    return expiresAt;
  }

  public async tryAcquire(key: string, ttlSeconds: number): Promise<boolean> {
    if (ttlSeconds <= 0) {
      throw new Error("OTP cooldown TTL must be greater than zero");
    }

    const existingExpiration = this.getValidExpiration(key);

    if (existingExpiration) {
      return false;
    }

    this.store.set(key, Date.now() + ttlSeconds * 1000);

    return true;
  }

  public async getRemainingSeconds(key: string): Promise<number> {
    const expiresAt = this.getValidExpiration(key);

    if (!expiresAt) {
      return 0;
    }

    return Math.ceil((expiresAt - Date.now()) / 1000);
  }

  public async release(key: string): Promise<void> {
    this.store.delete(key);
  }
}
