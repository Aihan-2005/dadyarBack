export const PAYMENT_METHODS = {
  CASH: "CASH",
  NON_CASH: "NON_CASH",
} as const;

export type PaymentMethod =
  (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];
