import "express";

import type { UserRole, UserStatus } from "./user.interface";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        status: UserStatus;
      };
    }
  }
}

export {};

