import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";

import { HttpException } from "../exceptions/httpException";

import { ClientService } from "../services/client.service";

import {
  ClientPhoneQuerySchema,
  CreateClientSchema,
  ListClientsQuerySchema,
  ParamClientIdSchema,
  UpdateClientSchema,
} from "../validators/client.validator";

const LANGUAGE = env.LANGUAGE;

export class ClientController {
  constructor(private readonly clientService: ClientService) {}

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

      const input = CreateClientSchema.parse(req.body ?? {});

      const client = await this.clientService.createClient(lawyerId, input);

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

      const options = ListClientsQuerySchema.parse(req.query);

      const result = await this.clientService.listClients(lawyerId, options);

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

      const { phone } = ClientPhoneQuerySchema.parse(req.query);

      const client = await this.clientService.findClientByPhone(
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

      const { clientId } = ParamClientIdSchema.parse(req.params);

      const client = await this.clientService.getClientById(lawyerId, clientId);

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

      const { clientId } = ParamClientIdSchema.parse(req.params);

      const input = UpdateClientSchema.parse(req.body ?? {});

      const updated = await this.clientService.updateClient(
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
