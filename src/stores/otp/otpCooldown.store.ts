export interface OtpCooldownStore {
  tryAcquire(key: string, ttlSeconds: number): Promise<boolean>;

  getRemainingSeconds(key: string): Promise<number>;

  release(key: string): Promise<void>;
}
