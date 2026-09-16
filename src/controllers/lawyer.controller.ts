import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  env,
} from "../config/env";

import {
  MESSAGES,
} from "../constants/messages.constants";

import {
  HttpException,
} from "../exceptions/httpException";

import {
  LawyerService,
} from "../services/lawyer.service";

import {
  LawyerSelfDirectoryService,
} from "../services/lawyerSelfDirectory.service";

import {
  LawyerDirectoryIdParamSchema,
  LawyerDirectoryListQuerySchema,
  LawyerProfilePatchSchema,
} from "../validators/lawyer.validator";

import {
  LawyerSelfDirectoryVisibilitySchema,
} from "../validators/lawyerSelfDirectory.validator";


const LANGUAGE =
  env.LANGUAGE;


export class LawyerController {
  constructor(
    private readonly lawyerService:
      LawyerService,

    private readonly selfDirectoryService =
      new LawyerSelfDirectoryService(),
  ) {}


  private getLawyerId(
    req:
      Request,
  ): string {
    const lawyerId =
      req.user?.id;


    if (
      !lawyerId
    ) {
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


  public listClientDirectory =
    async (
      req:
        Request,

      res:
        Response,

      next:
        NextFunction,
    ): Promise<
      | Response
      | void
    > => {
      try {
        const query =
          LawyerDirectoryListQuerySchema.parse(
            req.query,
          );


        const result =
          await this.lawyerService
            .listClientDirectory(
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


  public getClientDirectoryLawyer =
    async (
      req:
        Request,

      res:
        Response,

      next:
        NextFunction,
    ): Promise<
      | Response
      | void
    > => {
      try {
        const {
          id,
        } =
          LawyerDirectoryIdParamSchema.parse(
            req.params,
          );


        const lawyer =
          await this.lawyerService
            .getClientDirectoryLawyer(
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
              lawyer,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };


  public me =
    async (
      req:
        Request,

      res:
        Response,

      next:
        NextFunction,
    ): Promise<
      | Response
      | void
    > => {
      try {
        const lawyerId =
          this.getLawyerId(
            req,
          );


        const lawyer =
          await this.lawyerService
            .findById(
              lawyerId,
            );


        if (
          !lawyer
        ) {
          throw new HttpException(
            404,

            MESSAGES.noUserWithId[
              LANGUAGE
            ],

            "LAWYER_NOT_FOUND",
          );
        }


        return res
          .status(
            200,
          )
          .json({
            success:
              true,

            data:
              lawyer,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };


  public getClientDirectoryState =
    async (
      req:
        Request,

      res:
        Response,

      next:
        NextFunction,
    ): Promise<
      | Response
      | void
    > => {
      try {
        const lawyerId =
          this.getLawyerId(
            req,
          );


        const state =
          await this.selfDirectoryService
            .getState(
              lawyerId,
            );


        return res
          .status(
            200,
          )
          .json({
            success:
              true,

            data:
              state,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };


  public updateClientDirectoryState =
    async (
      req:
        Request,

      res:
        Response,

      next:
        NextFunction,
    ): Promise<
      | Response
      | void
    > => {
      try {
        const lawyerId =
          this.getLawyerId(
            req,
          );


        const input =
          LawyerSelfDirectoryVisibilitySchema.parse(
            req.body ??
              {},
          );


        const state =
          await this.selfDirectoryService
            .setVisibility(
              lawyerId,

              input.isVisible,
            );


        return res
          .status(
            200,
          )
          .json({
            success:
              true,

            data:
              state,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };


  public getProfile =
    async (
      req:
        Request,

      res:
        Response,

      next:
        NextFunction,
    ): Promise<
      | Response
      | void
    > => {
      try {
        const lawyerId =
          this.getLawyerId(
            req,
          );


        const profile =
          await this.lawyerService
            .findProfileById(
              lawyerId,
            );


        return res
          .status(
            200,
          )
          .json({
            success:
              true,

            data: {
              profile,
            },
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };


  public updateProfile =
    async (
      req:
        Request,

      res:
        Response,

      next:
        NextFunction,
    ): Promise<
      | Response
      | void
    > => {
      try {
        const lawyerId =
          this.getLawyerId(
            req,
          );


        /*
         * PATCH واقعی:
         * فقط فیلدهای ارسال‌شده validate می‌شوند.
         */
        const input =
          await LawyerProfilePatchSchema
            .parseAsync(
              req.body ??
                {},
            );


        /*
         * اگر پروفایل منتشر شده باشد، فقط بررسی می‌کنیم
         * که PATCH فعلی باعث ناقص‌شدن اطلاعات پایه نشود.
         */
        await this.selfDirectoryService
          .assertPublishedProfileCanBeUpdated(
            lawyerId,

            input,
          );


        const profile =
          await this.lawyerService
            .updateProfile(
              lawyerId,

              input,
            );


        return res
          .status(
            200,
          )
          .json({
            success:
              true,

            data: {
              profile,
            },
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
