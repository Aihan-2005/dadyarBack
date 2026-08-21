import type { OtpPurpose } from "../constants/otp.constants";

export interface StoredOtp {
  codeHash: string;

  attempts: number;

  createdAt: number;

  expiresAt: number;
}

export interface SaveOtpInput {
  codeHash: string;

  attempts?: number;
}

export type OtpChannel = "phone" | "email";

export interface OtpIdentifier {
  channel: OtpChannel;

  destination: string;

  purpose: OtpPurpose;
}

export type CreateOtpInput = OtpIdentifier;

export interface CreateOtpOptions {
  deliver?: boolean;
}

export interface VerifyOtpInput extends OtpIdentifier {
  code: string;
}

export interface CreateOtpResult {
  expiresIn: number;

  resendAfter: number;
}

export interface VerifyOtpResult {
  verified: true;
}
