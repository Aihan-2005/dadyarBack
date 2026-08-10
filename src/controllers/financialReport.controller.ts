import type { NextFunction, Request, Response } from "express";

import { HttpException } from "../exceptions/httpException";

import { FinancialReportService } from "../services/financialReport.service";

import {
  FinancialClientCasesQuerySchema,
  FinancialClientIdParamSchema,
  FinancialClientReportQuerySchema,
} from "../validators/financialReport.validator";

import { MESSAGES } from "../constants/messages.constants";

import { env } from "../config/env";

const LANGUAGE = env.LANGUAGE;
export class FinancialReportController {
  private readonly service = new FinancialReportService();

  // ---------------- Helpers ----------------

  private getLawyerId(req: Request): string {
    const lawyerId = req.user?.id;

    if (!lawyerId) {
      throw new HttpException(
        401,
        MESSAGES.unauthorized[LANGUAGE],
        "UNAUTHORIZED",
      );
    }

    return lawyerId;
  }

  // ---------------- Summary ----------------

  public getSummary = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const data = await this.service.getLawyerSummary(lawyerId);

      return res.status(200).json({
        success: true,

        data,
      });
    } catch (error) {
      return next(error);
    }
  };

  // ---------------- Clients ----------------

  public getClientFinancialReport = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const query = FinancialClientReportQuerySchema.parse(req.query);

      const data = await this.service.getClientFinancialReport(lawyerId, query);

      return res.status(200).json({
        success: true,

        data,
      });
    } catch (error) {
      return next(error);
    }
  };

  public getClientCaseFinancialReport = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { clientId } = FinancialClientIdParamSchema.parse(req.params);

      const query = FinancialClientCasesQuerySchema.parse(req.query);

      const data = await this.service.getClientCaseFinancialReport(
        lawyerId,
        clientId,
        query,
      );

      return res.status(200).json({
        success: true,

        data,
      });
    } catch (error) {
      return next(error);
    }
  };
}
