import type { NextFunction, Request, Response } from "express";

import { PaymentService } from "../services/payment.service";

import {
  AdminPaymentListQuerySchema,
  CreateSubscriptionPaymentSchema,
  PaymentHistoryQuerySchema,
  PaymentIdParamSchema,
  ZarinPalCallbackQuerySchema,
} from "../validators/payment.validator";
import { env } from "../config/env";

export class PaymentController {
  constructor(
    private readonly service: PaymentService = new PaymentService(),
  ) {}

  public createSubscriptionPayment = async (
    req: Request,

    res: Response,

    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const input = CreateSubscriptionPaymentSchema.parse(req.body ?? {});

      const result = await this.service.createSubscriptionPayment(
        req.user!.id,

        input,
      );

      return res.status(201).json({
        success: true,

        data: result,
      });
    } catch (error) {
      return next(error);
    }
  };

  public handleZarinPalCallback = async (
    req: Request,

    res: Response,

    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const input = ZarinPalCallbackQuerySchema.parse(req.query);

      const result = await this.service.handleZarinPalCallback(input);

      const redirectUrl = new URL(env.PAYMENT_RESULT_URL);

      redirectUrl.searchParams.set(
        "paymentId",

        result.paymentId,
      );

      return res.redirect(
        303,

        redirectUrl.toString(),
      );
    } catch (error) {
      return next(error);
    }
  };

  public listMyPayments = async (
    req: Request,

    res: Response,

    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const query = PaymentHistoryQuerySchema.parse(req.query);

      const result = await this.service.listLawyerPayments(
        req.user!.id,

        query,
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

  public listPaymentsForAdmin = async (
    req: Request,

    res: Response,

    next: NextFunction,
  ) => {
    try {
      const query = AdminPaymentListQuerySchema.parse(req.query);

      const result = await this.service.listPaymentsForAdmin(query);

      return res.status(200).json({
        success: true,

        data: result.items,

        pagination: result.pagination,
      });
    } catch (error) {
      return next(error);
    }
  };

  public getPaymentForAdmin = async (
    req: Request,

    res: Response,

    next: NextFunction,
  ) => {
    try {
      const { id } = PaymentIdParamSchema.parse(req.params);

      const payment = await this.service.getPaymentForAdmin(id);

      return res.status(200).json({
        success: true,

        data: payment,
      });
    } catch (error) {
      return next(error);
    }
  };

  public retryPaymentFulfillmentForAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = PaymentIdParamSchema.parse(req.params);

      const result = await this.service.retryPaymentFulfillmentForAdmin(id);

      return res.status(200).json({
        success: true,

        data: result,
      });
    } catch (error) {
      return next(error);
    }
  };

  public getMyPayment = async (
    req: Request,

    res: Response,

    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { id } = PaymentIdParamSchema.parse(req.params);

      const payment = await this.service.getMyPayment(
        req.user!.id,

        id,
      );

      return res.status(200).json({
        success: true,

        data: payment,
      });
    } catch (error) {
      return next(error);
    }
  };
}
