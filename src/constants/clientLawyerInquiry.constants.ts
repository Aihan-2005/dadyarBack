export const CLIENT_LAWYER_INQUIRY_STATUSES = [
  "SUBMITTED",
  "IN_REVIEW",
  "ACCEPTED",
  "REJECTED",
  "CANCELLED",
  "CLOSED",
] as const;

export type ClientLawyerInquiryStatus =
  (typeof CLIENT_LAWYER_INQUIRY_STATUSES)[number];