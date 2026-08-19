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

export interface OtpIdentifier {
  phone: string;

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
