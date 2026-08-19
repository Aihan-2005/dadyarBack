import type { SaveOtpInput, StoredOtp } from "../../interfaces/otp.interface";

export interface OtpStore {
  set(key: string, input: SaveOtpInput, ttlSeconds: number): Promise<StoredOtp>;

  get(key: string): Promise<StoredOtp | null>;

  delete(key: string): Promise<void>;

  exists(key: string): Promise<boolean>;

  incrementAttempts(key: string): Promise<number | null>;

  consume(key: string, expectedCodeHash: string): Promise<StoredOtp | null>;
}
