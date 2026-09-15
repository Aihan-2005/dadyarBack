import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  HttpException,
} from "../exceptions/httpException";

import {
  ClientLawyerInquiryService,
} from "../services/clientLawyerInquiry.service";

import {
  ClientLawyerInquiryIdParamSchema,
  ClientLawyerInquiryListQuerySchema,
  CreateClientLawyerInquirySchema,
  LawyerInquiryDecisionSchema,
} from "../validators/clientLawyerInquiry.validator";


export class ClientLawyerInquiryController {
  constructor(
    private readonly service =
      new ClientLawyerInquiryService(),
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
          CreateClientLawyerInquirySchema
            .parse(
              req.body ??
                {},
            );

        const inquiry =
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
              inquiry,
          });
      } catch (error) {
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
        const query =
          ClientLawyerInquiryListQuerySchema
            .parse(
              req.query,
            );

        const result =
          await this.service
            .listForClient(
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
              result.items,

            pagination:
              result.pagination,
          });
      } catch (error) {
        return next(
          error,
        );
      }
    };


  public getForClient =
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
          ClientLawyerInquiryIdParamSchema
            .parse(
              req.params,
            );

        const inquiry =
          await this.service
            .getForClient(
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
              inquiry,
          });
      } catch (error) {
        return next(
          error,
        );
      }
    };


  public cancelForClient =
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
          ClientLawyerInquiryIdParamSchema
            .parse(
              req.params,
            );

        const inquiry =
          await this.service
            .cancelForClient(
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
              inquiry,
          });
      } catch (error) {
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
          ClientLawyerInquiryListQuerySchema
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
              result.items,

            pagination:
              result.pagination,
          });
      } catch (error) {
        return next(
          error,
        );
      }
    };


  public getForLawyer =
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
          ClientLawyerInquiryIdParamSchema
            .parse(
              req.params,
            );

        const inquiry =
          await this.service
            .getForLawyer(
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
              inquiry,
          });
      } catch (error) {
        return next(
          error,
        );
      }
    };


  public decideForLawyer =
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
          ClientLawyerInquiryIdParamSchema
            .parse(
              req.params,
            );

        const input =
          LawyerInquiryDecisionSchema
            .parse(
              req.body ??
                {},
            );

        const inquiry =
          await this.service
            .decideForLawyer(
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
              inquiry,
          });
      } catch (error) {
        return next(
          error,
        );
      }
    };
}
