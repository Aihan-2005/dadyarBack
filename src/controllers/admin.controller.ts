import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  AdminService,
} from "../services/admin.service";

import {
  AdminClientListQuerySchema,
  AdminCreateLawyerSchema,
  AdminLawyerListQuerySchema,
  AdminPublishClientLawyerSchema,
  AdminResetUserPasswordSchema,
  AdminUpdateClientLawyerSchema,
  AdminUpdateLawyerStatusSchema,
  AdminUpdateUserStatusSchema,
  AdminUserIdParamSchema,
} from "../validators/admin.validator";

export class AdminController {
  constructor(
    private readonly adminService:
      AdminService,
  ) {}

  private async resetUserPassword(
    req:
      Request,

    res:
      Response,

    role:
      | "LAWYER"
      | "CLIENT",
  ): Promise<Response> {
    const {
      id,
    } =
      AdminUserIdParamSchema.parse(
        req.params,
      );

    const {
      newPassword,
    } =
      AdminResetUserPasswordSchema.parse(
        req.body ??
          {},
      );

    await this.adminService.resetUserPassword(
      id,
      role,
      newPassword,
    );

    return res
      .status(200)
      .json({
        success:
          true,
      });
  }

  public createLawyer =
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
        const input =
          AdminCreateLawyerSchema.parse(
            req.body ??
              {},
          );

        const lawyer =
          await this.adminService.createLawyer(
            input,
          );

        return res
          .status(201)
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

  public listLawyers =
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
          AdminLawyerListQuerySchema.parse(
            req.query,
          );

        const result =
          await this.adminService.listLawyers(
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
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };

  public getLawyer =
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
          AdminUserIdParamSchema.parse(
            req.params,
          );

        const lawyer =
          await this.adminService.getLawyerById(
            id,
          );

        return res
          .status(200)
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

  public updateLawyerStatus =
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
          AdminUserIdParamSchema.parse(
            req.params,
          );

        const {
          status,
        } =
          AdminUpdateLawyerStatusSchema.parse(
            req.body ??
              {},
          );

        const lawyer =
          await this.adminService.updateLawyerStatus(
            id,
            status,
          );

        return res
          .status(200)
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

  public updateLawyerAccountStatus =
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
          AdminUserIdParamSchema.parse(
            req.params,
          );

        const {
          status,
        } =
          AdminUpdateUserStatusSchema.parse(
            req.body ??
              {},
          );

        const user =
          await this.adminService.updateUserAccountStatus(
            id,
            "LAWYER",
            status,
          );

        return res
          .status(200)
          .json({
            success:
              true,

            data:
              user,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };

  public resetLawyerPassword =
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
        return await this.resetUserPassword(
          req,
          res,
          "LAWYER",
        );
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };

  public listClientLawyers =
    async (
      _req:
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
        const placements =
          await this.adminService.listClientLawyerPlacements();

        return res
          .status(200)
          .json({
            success:
              true,

            data:
              placements,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };

  public publishClientLawyer =
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
          AdminUserIdParamSchema.parse(
            req.params,
          );

        const input =
          AdminPublishClientLawyerSchema.parse(
            req.body ??
              {},
          );

        const placement =
          await this.adminService.publishLawyerToClientDirectory(
            id,
            input,
          );

        return res
          .status(201)
          .json({
            success:
              true,

            data:
              placement,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };

  public updateClientLawyer =
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
          AdminUserIdParamSchema.parse(
            req.params,
          );

        const input =
          AdminUpdateClientLawyerSchema.parse(
            req.body ??
              {},
          );

        const placement =
          await this.adminService.updateClientLawyerPlacement(
            id,
            input,
          );

        return res
          .status(200)
          .json({
            success:
              true,

            data:
              placement,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };

  public removeClientLawyer =
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
          AdminUserIdParamSchema.parse(
            req.params,
          );

        await this.adminService.removeLawyerFromClientDirectory(
          id,
        );

        return res
          .status(200)
          .json({
            success:
              true,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };

  public listClients =
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
          AdminClientListQuerySchema.parse(
            req.query,
          );

        const result =
          await this.adminService.listClients(
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
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };

  public getClient =
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
          AdminUserIdParamSchema.parse(
            req.params,
          );

        const client =
          await this.adminService.getClientById(
            id,
          );

        return res
          .status(200)
          .json({
            success:
              true,

            data:
              client,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };

  public updateClientAccountStatus =
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
          AdminUserIdParamSchema.parse(
            req.params,
          );

        const {
          status,
        } =
          AdminUpdateUserStatusSchema.parse(
            req.body ??
              {},
          );

        const user =
          await this.adminService.updateUserAccountStatus(
            id,
            "CLIENT",
            status,
          );

        return res
          .status(200)
          .json({
            success:
              true,

            data:
              user,
          });
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };

  public resetClientPassword =
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
        return await this.resetUserPassword(
          req,
          res,
          "CLIENT",
        );
      } catch (
        error
      ) {
        return next(
          error,
        );
      }
    };

  public getDashboard =
    async (
      _req:
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
        const dashboard =
          await this.adminService.getDashboard();

        return res
          .status(200)
          .json({
            success:
              true,

            data:
              dashboard,
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
