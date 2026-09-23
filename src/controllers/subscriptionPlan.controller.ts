import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  SubscriptionPlanService,
} from "../services/subscriptionPlan.service";

import {
  CreateSubscriptionPlanSchema,
  SubscriptionPlanIdParamSchema,
  UpdateSubscriptionPlanSchema,
} from "../validators/subscriptionPlan.validator";

import {
  UpdateSubscriptionSettingsSchema,
} from "../validators/subscriptionSettings.validator";

export class SubscriptionPlanController {
  constructor(
    private readonly service:
      SubscriptionPlanService =
        new SubscriptionPlanService(),
  ) {}

  public listPublicPlans =
    async (
      _req:
        Request,

      res:
        Response,

      next:
        NextFunction,
    ): Promise<
      Response |
      void
    > => {
      try {
        const plans =
          await this.service
            .listPublicPlans();

        return res
          .status(
            200,
          )
          .json({
            success:
              true,

            data:
              plans,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };

  public getPublicPlan =
    async (
      req:
        Request,

      res:
        Response,

      next:
        NextFunction,
    ): Promise<
      Response |
      void
    > => {
      try {
        const {
          id,
        } =
          SubscriptionPlanIdParamSchema
            .parse(
              req.params,
            );

        const plan =
          await this.service
            .getPublicPlan(
              id,
            );

        return res
          .status(
            200,
          )
          .json({
            success:
              true,

            data:
              plan,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };

  public listPlansForAdmin =
    async (
      _req:
        Request,

      res:
        Response,

      next:
        NextFunction,
    ): Promise<
      Response |
      void
    > => {
      try {
        const plans =
          await this.service
            .listPlansForAdmin();

        return res
          .status(
            200,
          )
          .json({
            success:
              true,

            data:
              plans,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };

  public createPlan =
    async (
      req:
        Request,

      res:
        Response,

      next:
        NextFunction,
    ): Promise<
      Response |
      void
    > => {
      try {
        const input =
          CreateSubscriptionPlanSchema
            .parse(
              req.body ??
                {},
            );

        const plan =
          await this.service
            .createPlan(
              input,
            );

        return res
          .status(
            201,
          )
          .json({
            success:
              true,

            data:
              plan,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };

  public updatePlan =
    async (
      req:
        Request,

      res:
        Response,

      next:
        NextFunction,
    ): Promise<
      Response |
      void
    > => {
      try {
        const {
          id,
        } =
          SubscriptionPlanIdParamSchema
            .parse(
              req.params,
            );

        const input =
          UpdateSubscriptionPlanSchema
            .parse(
              req.body ??
                {},
            );

        const plan =
          await this.service
            .updatePlan(
              id,
              input,
            );

        return res
          .status(
            200,
          )
          .json({
            success:
              true,

            data:
              plan,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };

  public getPlanOptions =
    async (
      _req:
        Request,

      res:
        Response,

      next:
        NextFunction,
    ): Promise<
      Response |
      void
    > => {
      try {
        const options =
          this.service
            .getPlanOptions();

        return res
          .status(
            200,
          )
          .json({
            success:
              true,

            data:
              options,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };

  public getSettings =
    async (
      _req:
        Request,

      res:
        Response,

      next:
        NextFunction,
    ): Promise<
      Response |
      void
    > => {
      try {
        const settings =
          await this.service
            .getSettings();

        return res
          .status(
            200,
          )
          .json({
            success:
              true,

            data:
              settings,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };

  public updateSettings =
    async (
      req:
        Request,

      res:
        Response,

      next:
        NextFunction,
    ): Promise<
      Response |
      void
    > => {
      try {
        const input =
          UpdateSubscriptionSettingsSchema
            .parse(
              req.body ??
                {},
            );

        const settings =
          await this.service
            .updateSettings(
              input,
            );

        return res
          .status(
            200,
          )
          .json({
            success:
              true,

            data:
              settings,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };
}