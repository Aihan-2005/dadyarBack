import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { env } from "../config/env";
import { MESSAGES } from "../constants/messages";

import { HttpExceptoin } from "../exceptions/httpException";

import { LawyerService } from "../services/lawyer.service";

import {
  LawyerProfileSchema,
} from "../validators/lawyer.validator";

const LANGUAGE = env.LANGUAGE;

export class LawyerController {
  constructor(
    private readonly lawyerService:
      LawyerService,
  ) {}

  private getLawyerId(
    req: Request,
  ): string {
    const lawyerId =
      req.user?.id;

    if (!lawyerId) {
      throw new HttpExceptoin(
        401,
        MESSAGES.unauthorized[
          LANGUAGE
        ],
      );
    }

    return lawyerId;
  }

  
  public me = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId =
        this.getLawyerId(req);

      const lawyer =
        await this.lawyerService
          .findById(
            lawyerId,
          );

      if (!lawyer) {
        throw new HttpExceptoin(
          404,
          MESSAGES.noUserWithId[
            LANGUAGE
          ],
        );
      }

      return res
        .status(200)
        .json({
          success: true,
          data: lawyer,
        });
    } catch (error) {
      return next(error);
    }
  };

 
  public updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId =
        this.getLawyerId(req);

      const profile =
        await LawyerProfileSchema
          .parseAsync(
            req.body ?? {},
          );

      const updated =
        await this.lawyerService
          .updateProfile(
            lawyerId,
            profile,
          );

      return res
        .status(200)
        .json({
          success: true,
          data: updated,
        });
    } catch (error) {
      return next(error);
    }
  };
}