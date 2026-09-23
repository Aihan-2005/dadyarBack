export const LAWYER_SUBSCRIPTION_ACTIVATION_SOURCES =
  [
    "TRIAL",
    "ADMIN",
    "PAYMENT",
  ] as const;

export const LAWYER_SUBSCRIPTION_STATUSES =
  [
    "ACTIVE",
    "EXPIRED",
    "CANCELLED",
  ] as const;

export const SUBSCRIPTION_DAY_DURATION_IN_MS =
  24 *
  60 *
  60 *
  1000;

 
export const SUBSCRIPTION_MONTH_DURATION_IN_MS =
  30 *
  SUBSCRIPTION_DAY_DURATION_IN_MS;