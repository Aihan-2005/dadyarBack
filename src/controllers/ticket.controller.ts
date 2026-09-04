import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";

import { HttpException } from "../exceptions/httpException";

import type { UploadAttachmentInput } from "../interfaces/attachment.interface";

import { TicketService } from "../services/ticket.service";

import {
  CreateTicketSchema,
  ParamTicketIdSchema,
  UpdateTicketStatusSchema,
} from "../validators/ticket.validator";

const LANGUAGE = env.LANGUAGE;

class TicketController {
  constructor(private readonly ticketService: TicketService) {}

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

  private getAttachment(
    file: Express.Multer.File | undefined,
  ): UploadAttachmentInput | undefined {
    if (!file) {
      return undefined;
    }

    return {
      originalName: file.originalname,

      mimeType: file.mimetype,

      buffer: file.buffer,
    };
  }

  public createTicket = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const input = CreateTicketSchema.parse(req.body ?? {});

      const attachment = this.getAttachment(req.file);

      const ticket = await this.ticketService.createTicket(
        lawyerId,
        input,
        attachment,
      );

      return res.status(201).json({
        success: true,

        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  };

  public listTickets = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const tickets = await this.ticketService.listTickets(lawyerId);

      return res.status(200).json({
        success: true,

        data: tickets,
      });
    } catch (error) {
      next(error);
    }
  };

  public getTicket = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

      const { id } = ParamTicketIdSchema.parse(req.params);

      const ticket = await this.ticketService.getTicket(lawyerId, id);

      return res.status(200).json({
        success: true,

        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  };

  public listTicketsForAdmin = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const tickets = await this.ticketService.listAllTickets();

      return res.status(200).json({
        success: true,
        data: tickets,
      });
    } catch (error) {
      return next(error);
    }
  };

  public getTicketForAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { id } = ParamTicketIdSchema.parse(req.params);

      const ticket = await this.ticketService.getTicketById(id);

      return res.status(200).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      return next(error);
    }
  };

  public updateTicketStatusForAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { id } = ParamTicketIdSchema.parse(req.params);

      const { status } = UpdateTicketStatusSchema.parse(req.body ?? {});

      const ticket = await this.ticketService.updateTicketStatus(id, status);

      return res.status(200).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default TicketController;
