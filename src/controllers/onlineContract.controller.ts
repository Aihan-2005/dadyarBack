import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  HttpException,
} from "../exceptions/httpException";

import {
  OnlineContractService,
} from "../services/onlineContract.service";

import {
  CreateOnlineContractSchema,
  OnlineContractIdParamSchema,
  OnlineContractListQuerySchema,
  RejectOnlineContractSchema,
  RequestOnlineContractChangesSchema,
  ReviewOnlineContractSchema,
} from "../validators/onlineContract.validator";

export class OnlineContractController {
  constructor(
    private readonly service =
      new OnlineContractService(),
  ) {}

  private getAuthenticatedUserId(
    req:
      Request,
  ): string {
    const userId =
      req.user?.id;

    if (
      !userId
    ) {
      throw new HttpException(
        401,
        "برای انجام این عملیات باید وارد حساب کاربری شوید",
        "UNAUTHORIZED",
      );
    }

    return userId;
  }

  public createForClient =
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
        const clientId =
          this.getAuthenticatedUserId(
            req,
          );

        const input =
          CreateOnlineContractSchema
            .parse(
              req.body ??
              {},
            );

        const contract =
          await this.service
            .createForClient(
              clientId,
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
              contract,
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
        const clientId =
          this.getAuthenticatedUserId(
            req,
          );

        const query =
          OnlineContractListQuerySchema
            .parse(
              req.query,
            );

        const result =
          await this.service
            .listForClient(
              clientId,
              query,
            );

        return res
          .status(
            200,
          )
          .json({
            success:
              true,

            data:
              result.items,

            pagination:
              result.pagination,
          });
      } catch (
        error
      ) {
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
        const clientId =
          this.getAuthenticatedUserId(
            req,
          );

        const {
          id,
        } =
          OnlineContractIdParamSchema
            .parse(
              req.params,
            );

        const contract =
          await this.service
            .getForClient(
              clientId,
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
              contract,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };

  public approveForClient =
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
        const clientId =
          this.getAuthenticatedUserId(
            req,
          );

        const {
          id,
        } =
          OnlineContractIdParamSchema
            .parse(
              req.params,
            );

        const contract =
          await this.service
            .approveForClient(
              clientId,
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
              contract,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };

  public requestChangesForClient =
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
        const clientId =
          this.getAuthenticatedUserId(
            req,
          );

        const {
          id,
        } =
          OnlineContractIdParamSchema
            .parse(
              req.params,
            );

        const input =
          RequestOnlineContractChangesSchema
            .parse(
              req.body ??
              {},
            );

        const contract =
          await this.service
            .requestChangesForClient(
              clientId,
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
              contract,
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
        const lawyerId =
          this.getAuthenticatedUserId(
            req,
          );

        const query =
          OnlineContractListQuerySchema
            .parse(
              req.query,
            );

        const result =
          await this.service
            .listForLawyer(
              lawyerId,
              query,
            );

        return res
          .status(
            200,
          )
          .json({
            success:
              true,

            data:
              result.items,

            pagination:
              result.pagination,
          });
      } catch (
        error
      ) {
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
        const lawyerId =
          this.getAuthenticatedUserId(
            req,
          );

        const {
          id,
        } =
          OnlineContractIdParamSchema
            .parse(
              req.params,
            );

        const contract =
          await this.service
            .getForLawyer(
              lawyerId,
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
              contract,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };

  public reviewForLawyer =
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
        const lawyerId =
          this.getAuthenticatedUserId(
            req,
          );

        const {
          id,
        } =
          OnlineContractIdParamSchema
            .parse(
              req.params,
            );

        const input =
          ReviewOnlineContractSchema
            .parse(
              req.body ??
              {},
            );

        const contract =
          await this.service
            .reviewForLawyer(
              lawyerId,
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
              contract,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };

  public signForLawyer =
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
        const lawyerId =
          this.getAuthenticatedUserId(
            req,
          );

        const {
          id,
        } =
          OnlineContractIdParamSchema
            .parse(
              req.params,
            );

        const contract =
          await this.service
            .signForLawyer(
              lawyerId,
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
              contract,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };

  public rejectForLawyer =
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
        const lawyerId =
          this.getAuthenticatedUserId(
            req,
          );

        const {
          id,
        } =
          OnlineContractIdParamSchema
            .parse(
              req.params,
            );

        const input =
          RejectOnlineContractSchema
            .parse(
              req.body ??
              {},
            );

        const contract =
          await this.service
            .rejectForLawyer(
              lawyerId,
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
              contract,
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

export default new OnlineContractController();