import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { env } from "../config/env";
import { MESSAGES } from "../constants/messages.constants";

import {
  HttpException,
} from "../exceptions/httpException";

import {
  LawyerService,
} from "../services/lawyer.service";

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
      throw new HttpException(
        401,
        MESSAGES.unauthorized[
          LANGUAGE
        ],
        "UNAUTHORIZED",
      );
    }

    return lawyerId;
  }

  public me = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<
    Response | void
  > => {
    try {
      const lawyerId =
        this.getLawyerId(req);

      const lawyer =
        await this.lawyerService
          .findById(lawyerId);

      if (!lawyer) {
        throw new HttpException(
          404,
          MESSAGES.noUserWithId[
            LANGUAGE
          ],
          "LAWYER_NOT_FOUND",
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

  public getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<
    Response | void
  > => {
    try {
      const lawyerId =
        this.getLawyerId(req);

      const profile =
        await this.lawyerService
          .findProfileById(
            lawyerId,
          );

      return res
        .status(200)
        .json({
          success: true,

          data: {
            profile,
          },
        });
    } catch (error) {
      return next(error);
    }
  };

  public updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<
    Response | void
  > => {
    try {
      const lawyerId =
        this.getLawyerId(req);

      const input =
        await LawyerProfileSchema
          .parseAsync(
            req.body ?? {},
          );

      const profile =
        await this.lawyerService
          .updateProfile(
            lawyerId,
            input,
          );

      return res
        .status(200)
        .json({
          success: true,

          data: {
            profile,
          },
        });
    } catch (error) {
      return next(error);
    }
  };
}