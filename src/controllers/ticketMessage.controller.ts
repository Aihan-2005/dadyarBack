import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";

import { HttpException } from "../exceptions/httpException";

import { TicketMessageService } from "../services/ticketMessage.service";

import { ParamTicketIdSchema } from "../validators/ticket.validator";

import {
  CreateTicketMessageSchema,
  ParamTicketMessageIdSchema,
} from "../validators/ticketMessage.validator";

import type { UploadAttachmentInput } from "../interfaces/attachment.interface";

const LANGUAGE = env.LANGUAGE;

class TicketMessageController {
  constructor(private readonly ticketMessageService: TicketMessageService) {}

  private getAuthenticatedUserId(req: Request): string {
    const userId = req.user?.id;

    if (!userId) {
      throw new HttpException(
        401,
        MESSAGES.unauthorized[LANGUAGE],
        "UNAUTHORIZED",
      );
    }

    return userId;
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

  public listMessages = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getAuthenticatedUserId(req);

      const { id } = ParamTicketIdSchema.parse(req.params);

      const messages = await this.ticketMessageService.listMessages(
        lawyerId,
        id,
      );

      return res.status(200).json({
        success: true,

        data: messages,
      });
    } catch (error) {
      next(error);
    }
  };

  public addMessage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getAuthenticatedUserId(req);

      const { id } = ParamTicketIdSchema.parse(req.params);

      const input = CreateTicketMessageSchema.parse(req.body ?? {});

      const attachment = this.getAttachment(req.file);

      const message = await this.ticketMessageService.addLawyerMessage(
        lawyerId,
        id,
        input,
        attachment,
      );

      return res.status(201).json({
        success: true,

        data: message,
      });
    } catch (error) {
      next(error);
    }
  };

  public getAttachmentDownloadUrlForAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { id, messageId } = ParamTicketMessageIdSchema.parse(req.params);

      const url =
        await this.ticketMessageService.getAttachmentDownloadUrlForAdmin(
          id,
          messageId,
        );

      return res.status(200).json({
        success: true,
        data: {
          url,
        },
      });
    } catch (error) {
      return next(error);
    }
  };

  public listMessagesForAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { id } = ParamTicketIdSchema.parse(req.params);

      const messages = await this.ticketMessageService.listMessagesForAdmin(id);

      return res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      return next(error);
    }
  };

  public addAdminMessage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const adminId = this.getAuthenticatedUserId(req);

      const { id } = ParamTicketIdSchema.parse(req.params);

      const input = CreateTicketMessageSchema.parse(req.body ?? {});

      const attachment = this.getAttachment(req.file);

      const message = await this.ticketMessageService.addAdminMessage(
        adminId,
        id,
        input,
        attachment,
      );

      return res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default TicketMessageController;
