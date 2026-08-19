export const NOTIFICATION_TYPES = [
  'reminder',
  'client_reminder',
  'case_update',
  'deadline',
  'system',
] as const;

export const NOTIFICATION_PRIORITIES = [
  'low',
  'medium',
  'high',
] as const;

export const NOTIFICATION_STATUSES = [
  'unread',
  'read',
  'dismissed',
] as const;

export const NOTIFICATION_TARGETS = [
  'lawyer',
  'client',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number];
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];
export type NotificationTarget = (typeof NOTIFICATION_TARGETS)[number];