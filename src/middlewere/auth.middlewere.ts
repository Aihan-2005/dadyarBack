import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { MESSAGES } from "../constants/messages";
import { HttpException } from "../exceptions/httpException";
import { LawyerRepository } from "../repositories/lawyer.repository";
import { TokenService } from "../services/token.service";

const LANGUAGE = env.LANGUAGE;

const tokenService = new TokenService();
const lawyerRepository = new LawyerRepository();

const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const accessToken = TokenService.getTokenFromHeaders(req);
  if (!accessToken)
    return next(new HttpException(401, MESSAGES.noTokenFound[LANGUAGE]));

  try {
    const payload = tokenService.verifyAccessToken(accessToken);

    if (!payload.userId) {
      return next(new HttpException(401, MESSAGES.unauthorized[LANGUAGE]));
    }

    const lawyer = await lawyerRepository.findById(payload.userId);
    if (!lawyer) {
      return next(new HttpException(401, MESSAGES.unableToFindUser[LANGUAGE]));
    }

    req.user = { id: payload.userId };

    return next();
  } catch (err) {
    return next(new HttpException(401, MESSAGES.unauthorized[LANGUAGE]));
  }
};

export default requireAuth;
