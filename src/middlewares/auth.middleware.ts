import type { NextFunction, Request, Response } from "express";

import { Types } from "mongoose";

import { env } from "../config/env";

import {
  LAWYER_ROLES,
  LAWYER_STATUSES,
  isActiveLawyerStatus,
  resolveLawyerRole,
  resolveLawyerStatus,
} from "../constants/lawyer.constants";

import { MESSAGES } from "../constants/messages.constants";

import { HttpException } from "../exceptions/httpException";

import { LawyerRepository } from "../repositories/lawyer.repository";

import { TokenService } from "../services/token.service";

const LANGUAGE = env.LANGUAGE;

const tokenService = new TokenService();

const lawyerRepository = new LawyerRepository();

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const accessToken = TokenService.getTokenFromHeaders(req);

  if (!accessToken) {
    return next(
      new HttpException(
        401,
        MESSAGES.noTokenFound[LANGUAGE],
        "ACCESS_TOKEN_REQUIRED",
      ),
    );
  }

  let userId: string;

  try {
    const payload = tokenService.verifyAccessToken(accessToken);

    userId = payload.sub;
  } catch (error) {
    return next(error);
  }

  if (!Types.ObjectId.isValid(userId)) {
    return next(
      new HttpException(
        401,
        MESSAGES.unauthorized[LANGUAGE],
        "INVALID_ACCESS_TOKEN",
      ),
    );
  }

  try {
    const account = await lawyerRepository.findAccessContextById(userId);

    if (!account) {
      throw new HttpException(
        401,
        MESSAGES.unableToFindUser[LANGUAGE],
        "SESSION_USER_NOT_FOUND",
      );
    }

    const role = resolveLawyerRole(account.role);

    const status = resolveLawyerStatus(account.status);

    if (role !== LAWYER_ROLES.LAWYER) {
      throw new HttpException(
        403,
        MESSAGES.invalidAccountRole[LANGUAGE],
        "INVALID_ACCOUNT_ROLE",
      );
    }

    if (status === LAWYER_STATUSES.SUSPENDED) {
      throw new HttpException(
        403,
        MESSAGES.accountSuspended[LANGUAGE],
        "ACCOUNT_SUSPENDED",
      );
    }

    if (status === LAWYER_STATUSES.REJECTED) {
      throw new HttpException(
        403,
        MESSAGES.accountRejected[LANGUAGE],
        "ACCOUNT_REJECTED",
      );
    }

    req.user = {
      id: userId,

      role,

      status,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireActiveLawyer = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.user || !isActiveLawyerStatus(req.user.status)) {
    return next(
      new HttpException(
        403,
        MESSAGES.accountPendingVerification[LANGUAGE],
        "ACCOUNT_NOT_ACTIVE",
      ),
    );
  }

  return next();
};

export default requireAuth;
