import type { NextFunction, Request, Response } from "express";

import { LawyerSubscriptionService } from "../services/lawyerSubscription.service";

import {
  CreateLawyerSubscriptionSchema,
  LawyerSubscriptionLawyerIdParamSchema,
} from "../validators/lawyerSubscription.validator";

export class LawyerSubscriptionController {
  constructor(
    private readonly service: LawyerSubscriptionService = new LawyerSubscriptionService(),
  ) {}

  public getCurrentSubscription = async (
    req: Request,

    res: Response,

    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = req.user!.id;

      const subscription = await this.service.getCurrentSubscription(lawyerId);

      return res.status(200).json({
        success: true,

        data: subscription,
      });
    } catch (error) {
      return next(error);
    }
  };

  public getSubscriptionHistoryForAdmin = async (
    req: Request,

    res: Response,

    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { id } = LawyerSubscriptionLawyerIdParamSchema.parse(req.params);

      const subscriptions = await this.service.getSubscriptionHistory(id);

      return res.status(200).json({
        success: true,

        data: subscriptions,
      });
    } catch (error) {
      return next(error);
    }
  };

  public createSubscriptionForAdmin = async (
    req: Request,

    res: Response,

    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { id } = LawyerSubscriptionLawyerIdParamSchema.parse(req.params);

      const input = CreateLawyerSubscriptionSchema.parse(req.body ?? {});

      const subscription = await this.service.createSubscriptionForAdmin(
        id,
        input,
        req.user!.id,
      );

      return res.status(201).json({
        success: true,

        data: subscription,
      });
    } catch (error) {
      return next(error);
    }
  };

  public cancelCurrentSubscriptionForAdmin = async (
    req: Request,

    res: Response,

    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { id } = LawyerSubscriptionLawyerIdParamSchema.parse(req.params);

      const subscription =
        await this.service.cancelCurrentSubscriptionForAdmin(id);

      return res.status(200).json({
        success: true,

        data: subscription,
      });
    } catch (error) {
      return next(error);
    }
  };
}
