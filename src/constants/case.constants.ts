export const CASE_STATES = [
  "PENDING",
  "IN_PROGRESS",
  "DONE",
  "ARCHIVED",
] as const;

export const CASE_PAYMENT_TYPES = [
  "CASH",
  "NON_CASH",
  "BOTH",
] as const;

export const COURT_TYPES = [
  "GENERAL_COURT",
  "REVOLUTIONARY_COURT",
  "CRIMINAL_COURT",
  "FAMILY_COURT",
  "JUVENILE_COURT",
  "LABOR_COURT",
  "GUILD_COURT",
  "CIVIL_COURT",
  "APPEAL_COURT",
] as const;

export type CaseState =
  (typeof CASE_STATES)[number];

export type CasePaymentType =
  (typeof CASE_PAYMENT_TYPES)[number];

export type CourtType =
  (typeof COURT_TYPES)[number];