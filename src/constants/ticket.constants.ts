export const TICKET_TYPES = ["BUG", "SUGGESTION"] as const;

export const TICKET_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_FOR_LAWYER",
  "RESOLVED",
  "CLOSED",
] as const;

export const TICKET_MESSAGE_SENDERS = ["LAWYER", "ADMIN"] as const;

export type TicketType = (typeof TICKET_TYPES)[number];

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export type TicketMessageSender = (typeof TICKET_MESSAGE_SENDERS)[number];
