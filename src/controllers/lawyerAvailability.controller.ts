import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  HttpException,
} from "../exceptions/httpException";

import {
  LawyerAvailabilityService,
} from "../services/lawyerAvailability.service";

import {
  CreateLawyerAvailabilitySchema,
  LawyerAvailabilityClientParamSchema,
  LawyerAvailabilityIdParamSchema,
  LawyerAvailabilityListQuerySchema,
  UpdateLawyerAvailabilitySchema,
} from "../validators/lawyerAvailability.validator";


export class LawyerAvailabilityController {
  constructor(
    private readonly service =
      new LawyerAvailabilityService(),
  ) {}


  private getUserId(
    req:
      Request,
  ): string {
    const userId =
      req.user?.id;


    if (!userId) {
      throw new HttpException(
        401,

        "ابتدا وارد حساب کاربری شوید",

        "UNAUTHORIZED",
      );
    }


    return userId;
  }


  public create =
    async (
      req:
        Request,

      res:
        Response,

      next:
        NextFunction,
    ): Promise<
      Response | void
    > => {
      try {
        const input =
          CreateLawyerAvailabilitySchema
            .parse(
              req.body ??
                {},
            );


        const result =
          await this.service
            .create(
              this.getUserId(
                req,
              ),

              input,
            );


        return res
          .status(201)
          .json({
            success:
              true,

            data:
              result,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };


  public listForLawyer =
    async (
      req:
        Request,

      res:
        Response,

      next:
        NextFunction,
    ): Promise<
      Response | void
    > => {
      try {
        const query =
          LawyerAvailabilityListQuerySchema
            .parse(
              req.query,
            );


        const result =
          await this.service
            .listForLawyer(
              this.getUserId(
                req,
              ),

              query,
            );


        return res
          .status(200)
          .json({
            success:
              true,

            data:
              result,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };


  public listForClient =
    async (
      req:
        Request,

      res:
        Response,

      next:
        NextFunction,
    ): Promise<
      Response | void
    > => {
      try {
        const {
          lawyerId,
        } =
          LawyerAvailabilityClientParamSchema
            .parse(
              req.params,
            );


        const query =
          LawyerAvailabilityListQuerySchema
            .parse(
              req.query,
            );


        const result =
          await this.service
            .listForClient(
              lawyerId,

              query,
            );


        return res
          .status(200)
          .json({
            success:
              true,

            data:
              result,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };


  public update =
    async (
      req:
        Request,

      res:
        Response,

      next:
        NextFunction,
    ): Promise<
      Response | void
    > => {
      try {
        const {
          id,
        } =
          LawyerAvailabilityIdParamSchema
            .parse(
              req.params,
            );


        const input =
          UpdateLawyerAvailabilitySchema
            .parse(
              req.body ??
                {},
            );


        const result =
          await this.service
            .update(
              this.getUserId(
                req,
              ),

              id,

              input,
            );


        return res
          .status(200)
          .json({
            success:
              true,

            data:
              result,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };


  public remove =
    async (
      req:
        Request,

      res:
        Response,

      next:
        NextFunction,
    ): Promise<
      Response | void
    > => {
      try {
        const {
          id,
        } =
          LawyerAvailabilityIdParamSchema
            .parse(
              req.params,
            );


        const result =
          await this.service
            .remove(
              this.getUserId(
                req,
              ),

              id,
            );


        return res
          .status(200)
          .json({
            success:
              true,

            data:
              result,
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
