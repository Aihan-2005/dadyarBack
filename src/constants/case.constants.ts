export const CASE_STATES = [
  "PENDING",
  "IN_PROGRESS",
  "DONE",
  "ARCHIVED",
] as const;

export const COURT_TYPES = [
  "GENERAL_COURT",
  "REVOLUTIONARY_COURT",
  "CRIMINAL_COURT",
  "FAMILY_COURT",
  "JUVENILE_COURT",
] as const;

export type CaseState = (typeof CASE_STATES)[number];
export type CourtType = (typeof COURT_TYPES)[number];
