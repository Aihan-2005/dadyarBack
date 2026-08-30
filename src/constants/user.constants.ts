export const USER_ROLES = {
  LAWYER: "LAWYER",
  CLIENT: "CLIENT",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_STATUSES = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;

export type UserStatus = (typeof USER_STATUSES)[keyof typeof USER_STATUSES];

export const DEFAULT_USER_STATUS: UserStatus = USER_STATUSES.ACTIVE;

const USER_ROLE_VALUES = new Set<string>(Object.values(USER_ROLES));

const USER_STATUS_VALUES = new Set<string>(Object.values(USER_STATUSES));

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLE_VALUES.has(value);
}

export function isUserStatus(value: unknown): value is UserStatus {
  return typeof value === "string" && USER_STATUS_VALUES.has(value);
}
