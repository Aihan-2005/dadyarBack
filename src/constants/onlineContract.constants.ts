export const ONLINE_CONTRACT_STATUSES = {
  WAITING_LAWYER_REVIEW: "waiting_lawyer_review",
  WAITING_CLIENT_APPROVAL: "waiting_client_approval",
  WAITING_LAWYER_SIGNATURE: "waiting_lawyer_signature",
  COMPLETED: "completed",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
} as const;

export type OnlineContractStatus =
  (typeof ONLINE_CONTRACT_STATUSES)[keyof typeof ONLINE_CONTRACT_STATUSES];

export const ONLINE_CONTRACT_PAYMENT_MODES = [
  "full",
  "staged",
  "installments",
] as const;

export type OnlineContractPaymentMode =
  (typeof ONLINE_CONTRACT_PAYMENT_MODES)[number];

export const ONLINE_CONTRACT_TEMPLATE_KEYS = [
  "legal_consultation",
  "case_legal_services",
  "document_services",
] as const;

export type OnlineContractTemplateKey =
  (typeof ONLINE_CONTRACT_TEMPLATE_KEYS)[number];

export const ONLINE_CONTRACT_VERSION_AUTHORS = [
  "client",
  "lawyer",
] as const;

export type OnlineContractVersionAuthor =
  (typeof ONLINE_CONTRACT_VERSION_AUTHORS)[number];

export const ONLINE_CONTRACT_ACTORS = [
  "client",
  "lawyer",
  "system",
] as const;

export type OnlineContractActor =
  (typeof ONLINE_CONTRACT_ACTORS)[number];

export const ONLINE_CONTRACT_AUDIT_ACTIONS = [
  "created_by_client",
  "reviewed_by_lawyer",
  "updated_by_lawyer",
  "sent_to_client",
  "approved_by_client",
  "changes_requested_by_client",
  "signed_by_lawyer",
  "rejected_by_lawyer",
  "cancelled",
] as const;

export type OnlineContractAuditAction =
  (typeof ONLINE_CONTRACT_AUDIT_ACTIONS)[number];

  