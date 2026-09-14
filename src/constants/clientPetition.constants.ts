export const CLIENT_PETITION_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "ARCHIVED",
] as const;

export type ClientPetitionStatus =
  (typeof CLIENT_PETITION_STATUSES)[number];