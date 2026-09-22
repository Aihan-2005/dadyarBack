export const PAYMENT_PROVIDERS = ["ZARINPAL"] as const;

export const PAYMENT_CURRENCIES = ["IRR"] as const;

export const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "CANCELLED",
  "REVERSED",
] as const;

export const PAYMENT_PROVIDER_TRANSACTION_STATES = [
  "VERIFIED",
  "PAID_UNVERIFIED",
  "PENDING",
  "FAILED",
  "REVERSED",
  "UNKNOWN",
] as const;

export const PAYMENT_FULFILLMENT_STATUSES = [
  "PENDING",
  "FULFILLED",
  "REQUIRES_ACTION",
  "NOT_APPLICABLE",
] as const;

export const ZARINPAL_SUCCESS_CODE = 100;

export const ZARINPAL_ALREADY_VERIFIED_CODE = 101;

export const ZARINPAL_MIN_AMOUNT = 1000;
