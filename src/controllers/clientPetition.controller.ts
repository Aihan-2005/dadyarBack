import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  HttpException,
} from "../exceptions/httpException";

import {
  ClientPetitionService,
} from "../services/clientPetition.service";

import {
  ClientPetitionIdParamSchema,
  ClientPetitionListQuerySchema,
  CreateClientPetitionSchema,
  UpdateClientPetitionSchema,
} from "../validators/clientPetition.validator";


export class ClientPetitionController {
  constructor(
    private readonly service =
      new ClientPetitionService(),
  ) {}


  private getClientId(
    req: Request,
  ): string {
    const clientId =
      req.user?.id;

    if (!clientId) {
      throw new HttpException(
        401,

        "برای انجام این عملیات باید وارد حساب موکل شوید",

        "UNAUTHORIZED",
      );
    }

    return clientId;
  }


  public create =
    async (
      req: Request,

      res: Response,

      next: NextFunction,
    ): Promise<
      Response | void
    > => {
      try {
        const clientId =
          this.getClientId(
            req,
          );

        const input =
          CreateClientPetitionSchema
            .parse(
              req.body ??
                {},
            );

        const petition =
          await this.service
            .create(
              clientId,

              input,
            );

        return res
          .status(201)
          .json({
            success:
              true,

            data:
              petition,
          });
      } catch (error) {
        return next(
          error,
        );
      }
    };


  public list =
    async (
      req: Request,

      res: Response,

      next: NextFunction,
    ): Promise<
      Response | void
    > => {
      try {
        const clientId =
          this.getClientId(
            req,
          );

        const query =
          ClientPetitionListQuerySchema
            .parse(
              req.query,
            );

        const result =
          await this.service
            .list(
              clientId,

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


  public getById =
    async (
      req: Request,

      res: Response,

      next: NextFunction,
    ): Promise<
      Response | void
    > => {
      try {
        const clientId =
          this.getClientId(
            req,
          );

        const {
          id,
        } =
          ClientPetitionIdParamSchema
            .parse(
              req.params,
            );

        const petition =
          await this.service
            .getById(
              clientId,

              id,
            );

        return res
          .status(200)
          .json({
            success:
              true,

            data:
              petition,
          });
      } catch (error) {
        return next(
          error,
        );
      }
    };


  public update =
    async (
      req: Request,

      res: Response,

      next: NextFunction,
    ): Promise<
      Response | void
    > => {
      try {
        const clientId =
          this.getClientId(
            req,
          );

        const {
          id,
        } =
          ClientPetitionIdParamSchema
            .parse(
              req.params,
            );

        const input =
          UpdateClientPetitionSchema
            .parse(
              req.body ??
                {},
            );

        const petition =
          await this.service
            .update(
              clientId,

              id,

              input,
            );

        return res
          .status(200)
          .json({
            success:
              true,

            data:
              petition,
          });
      } catch (error) {
        return next(
          error,
        );
      }
    };


  public submit =
    async (
      req: Request,

      res: Response,

      next: NextFunction,
    ): Promise<
      Response | void
    > => {
      try {
        const clientId =
          this.getClientId(
            req,
          );

        const {
          id,
        } =
          ClientPetitionIdParamSchema
            .parse(
              req.params,
            );

        const petition =
          await this.service
            .submit(
              clientId,

              id,
            );

        return res
          .status(200)
          .json({
            success:
              true,

            data:
              petition,
          });
      } catch (error) {
        return next(
          error,
        );
      }
    };


  public archive =
    async (
      req: Request,

      res: Response,

      next: NextFunction,
    ): Promise<
      Response | void
    > => {
      try {
        const clientId =
          this.getClientId(
            req,
          );

        const {
          id,
        } =
          ClientPetitionIdParamSchema
            .parse(
              req.params,
            );

        const petition =
          await this.service
            .archive(
              clientId,

              id,
            );

        return res
          .status(200)
          .json({
            success:
              true,

            data:
              petition,
          });
      } catch (error) {
        return next(
          error,
        );
      }
    };


  public deleteDraft =
    async (
      req: Request,

      res: Response,

      next: NextFunction,
    ): Promise<
      Response | void
    > => {
      try {
        const clientId =
          this.getClientId(
            req,
          );

        const {
          id,
        } =
          ClientPetitionIdParamSchema
            .parse(
              req.params,
            );

        const result =
          await this.service
            .deleteDraft(
              clientId,

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
      } catch (error) {
        return next(
          error,
        );
      }
    };
}
