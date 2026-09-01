import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";

import { HttpException } from "../exceptions/httpException";

import { ClientCaseService } from "../services/clientCase.service";

import {
  ListCasesQuerySchema,
  ParamCaseIdSchema,
} from "../validators/case.validator";

const LANGUAGE = env.LANGUAGE;

export class ClientCaseController {
  constructor(private readonly clientCaseService = new ClientCaseService()) {}

  private getUserId(req: Request): string {
    const userId = req.user?.id;

    if (!userId) {
      throw new HttpException(
        401,

        MESSAGES.unauthorized[LANGUAGE],

        "UNAUTHORIZED",
      );
    }

    return userId;
  }

  public listCases = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const userId = this.getUserId(req);

      const options = ListCasesQuerySchema.parse(req.query);

      const result = await this.clientCaseService.listCases(
        userId,

        options,
      );

      return res.status(200).json({
        success: true,

        data: result.items,

        pagination: result.pagination,
      });
    } catch (error) {
      return next(error);
    }
  };

  public getCaseById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const userId = this.getUserId(req);

      const { caseId } = ParamCaseIdSchema.parse(req.params);

      const foundCase = await this.clientCaseService.getCaseById(
        userId,

        caseId,
      );

      return res.status(200).json({
        success: true,

        data: foundCase,
      });
    } catch (error) {
      return next(error);
    }
  };
}
