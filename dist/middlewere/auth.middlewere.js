"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireActiveLawyer = exports.requireAuth = void 0;
const mongoose_1 = require("mongoose");
const env_1 = require("../config/env");
const lawyer_constants_1 = require("../constants/lawyer.constants");
const messages_1 = require("../constants/messages");
const httpException_1 = require("../exceptions/httpException");
const lawyer_repository_1 = require("../repositories/lawyer.repository");
const token_service_1 = require("../services/token.service");
const LANGUAGE = env_1.env.LANGUAGE;
const tokenService = new token_service_1.TokenService();
const lawyerRepository = new lawyer_repository_1.LawyerRepository();
const requireAuth = async (req, _res, next) => {
  const accessToken = token_service_1.TokenService.getTokenFromHeaders(req);
  if (!accessToken) {
    return next(
      new httpException_1.HttpException(
        401,
        messages_1.MESSAGES.noTokenFound[LANGUAGE],
        "ACCESS_TOKEN_REQUIRED",
      ),
    );
  }
  let userId;
  try {
    const payload = tokenService.verifyAccessToken(accessToken);
    userId = payload.sub;
  } catch (error) {
    return next(error);
  }
  if (!mongoose_1.Types.ObjectId.isValid(userId)) {
    return next(
      new httpException_1.HttpException(
        401,
        messages_1.MESSAGES.unauthorized[LANGUAGE],
        "INVALID_ACCESS_TOKEN",
      ),
    );
  }
  try {
    const account = await lawyerRepository.findAccessContextById(userId);
    if (!account) {
      throw new httpException_1.HttpException(
        401,
        messages_1.MESSAGES.unableToFindUser[LANGUAGE],
        "SESSION_USER_NOT_FOUND",
      );
    }
    const role = (0, lawyer_constants_1.resolveLawyerRole)(account.role);
    const status = (0, lawyer_constants_1.resolveLawyerStatus)(account.status);
    if (role !== lawyer_constants_1.LAWYER_ROLES.LAWYER) {
      throw new httpException_1.HttpException(
        403,
        messages_1.MESSAGES.invalidAccountRole[LANGUAGE],
        "INVALID_ACCOUNT_ROLE",
      );
    }
    if (status === lawyer_constants_1.LAWYER_STATUSES.SUSPENDED) {
      throw new httpException_1.HttpException(
        403,
        messages_1.MESSAGES.accountSuspended[LANGUAGE],
        "ACCOUNT_SUSPENDED",
      );
    }
    if (status === lawyer_constants_1.LAWYER_STATUSES.REJECTED) {
      throw new httpException_1.HttpException(
        403,
        messages_1.MESSAGES.accountRejected[LANGUAGE],
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
exports.requireAuth = requireAuth;
const requireActiveLawyer = (req, _res, next) => {
  if (
    !req.user ||
    !(0, lawyer_constants_1.isActiveLawyerStatus)(req.user.status)
  ) {
    return next(
      new httpException_1.HttpException(
        403,
        messages_1.MESSAGES.accountPendingVerification[LANGUAGE],
        "ACCOUNT_NOT_ACTIVE",
      ),
    );
  }
  return next();
};
exports.requireActiveLawyer = requireActiveLawyer;
exports.default = exports.requireAuth;
