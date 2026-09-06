export const SMS_PROVIDERS = {
  SMS_IR: "SMS_IR",
  MELIPAYAMAK: "MELIPAYAMAK",
} as const;

export type SmsProviderName =
  (typeof SMS_PROVIDERS)[keyof typeof SMS_PROVIDERS];
