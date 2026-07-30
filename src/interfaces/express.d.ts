import "express";

import type {
  LawyerRole,
  LawyerStatus,
} from "../constants/lawyer.constants";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: LawyerRole;
        status: LawyerStatus;
      };
    }
  }
}

export {};