import type { NextFunction, Request, Response } from "express";

import { PaymentService } from "../services/payment.service";

import { CreateSubscriptionPaymentSchema } from "../validators/payment.validator";

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
}
