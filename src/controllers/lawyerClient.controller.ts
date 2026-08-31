import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";

import { HttpException } from "../exceptions/httpException";

import { LawyerClientService } from "../services/lawyerClient.service";

import {
  CreateLawyerClientSchema,
  LawyerClientPhoneQuerySchema,
  LawyerClientIdParamSchema,
  ListLawyerClientsQuerySchema,
  UpdateLawyerClientSchema,
} from "../validators/lawyerClient.validator";

const LANGUAGE = env.LANGUAGE;

export class LawyerClientController {
  constructor(private readonly lawyerClientService: LawyerClientService) {}

  // ---------------- Helpers ----------------

  private getLawyerId(req: Request): string {
    const lawyerId = req.user?.id;

    if (!lawyerId) {
      throw new HttpException(
        401,

        MESSAGES.unauthorized[LANGUAGE],

        "UNAUTHORIZED",
      );
    }

    return lawyerId;
  }

  private disableCaching(res: Response): void {
    res.setHeader("Cache-Control", "no-store");

    res.setHeader("Pragma", "no-cache");
  }

  // ---------------- Create ----------------

  // POST /clients
  public createClient = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const input = CreateLawyerClientSchema.parse(req.body ?? {});

      const client = await this.lawyerClientService.createLawyerClient(
        lawyerId,
        input,
      );

      return res.status(201).json({
        success: true,

        data: client,
      });
    } catch (error) {
      return next(error);
    }
  };

  // ---------------- Read ----------------

  // GET /clients
  public listClients = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const options = ListLawyerClientsQuerySchema.parse(req.query);

      const result = await this.lawyerClientService.listLawyerClients(
        lawyerId,
        options,
      );

      this.disableCaching(res);

      return res.status(200).json({
        success: true,

        data: result.items,

        pagination: result.pagination,
      });
    } catch (error) {
      return next(error);
    }
  };

  // GET /clients/lookup?phone=09123456789
  public lookupByPhone = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { phone } = LawyerClientPhoneQuerySchema.parse(req.query);

      const client = await this.lawyerClientService.findLawyerClientByPhone(
        lawyerId,
        phone,
      );

      this.disableCaching(res);

      return res.status(200).json({
        success: true,

        data: client ?? null,
      });
    } catch (error) {
      return next(error);
    }
  };

  // GET /clients/:clientId
  public getClientById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { clientId } = LawyerClientIdParamSchema.parse(req.params);

      const client = await this.lawyerClientService.getLawyerClientById(
        lawyerId,
        clientId,
      );

      this.disableCaching(res);

      return res.status(200).json({
        success: true,

        data: client,
      });
    } catch (error) {
      return next(error);
    }
  };

  // ---------------- Update ----------------

  // PATCH /clients/:clientId
  public updateClient = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { clientId } = LawyerClientIdParamSchema.parse(req.params);

      const input = UpdateLawyerClientSchema.parse(req.body ?? {});

      const updated = await this.lawyerClientService.updateLawyerClient(
        lawyerId,
        clientId,
        input,
      );

      return res.status(200).json({
        success: true,

        data: updated,
      });
    } catch (error) {
      return next(error);
    }
  };
}
