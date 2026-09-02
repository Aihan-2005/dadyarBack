export const LAWYER_ROLES = {
  LAWYER: "LAWYER",
} as const;

export type LawyerRole = (typeof LAWYER_ROLES)[keyof typeof LAWYER_ROLES];

export const LAWYER_STATUSES = {
  PENDING_VERIFICATION: "PENDING_VERIFICATION",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  REJECTED: "REJECTED",
} as const;

export type LawyerStatus =
  (typeof LAWYER_STATUSES)[keyof typeof LAWYER_STATUSES];

export const DEFAULT_LAWYER_ROLE: LawyerRole = LAWYER_ROLES.LAWYER;

export const DEFAULT_LAWYER_STATUS: LawyerStatus =
  LAWYER_STATUSES.PENDING_VERIFICATION;

const LAWYER_ROLE_VALUES = new Set<string>(Object.values(LAWYER_ROLES));

const LAWYER_STATUS_VALUES = new Set<string>(Object.values(LAWYER_STATUSES));

export function isLawyerRole(value: unknown): value is LawyerRole {
  return typeof value === "string" && LAWYER_ROLE_VALUES.has(value);
}

export function isLawyerStatus(value: unknown): value is LawyerStatus {
  return typeof value === "string" && LAWYER_STATUS_VALUES.has(value);
}

export function resolveLawyerRole(value: unknown): LawyerRole {
  return isLawyerRole(value) ? value : DEFAULT_LAWYER_ROLE;
}

export function resolveLawyerStatus(value: unknown): LawyerStatus {
  return isLawyerStatus(value) ? value : DEFAULT_LAWYER_STATUS;
}

export function isActiveLawyerStatus(status: LawyerStatus): boolean {
  return status === LAWYER_STATUSES.ACTIVE;
}

export const SKILL_LEVELS = [1, 2, 3, 4, 5] as const;

