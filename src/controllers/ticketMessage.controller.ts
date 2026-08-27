import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";

import { HttpException } from "../exceptions/httpException";

import { TicketMessageService } from "../services/ticketMessage.service";

import { ParamTicketIdSchema } from "../validators/ticket.validator";

import { CreateTicketMessageSchema } from "../validators/ticketMessage.validator";

const LANGUAGE = env.LANGUAGE;

class TicketMessageController {
  constructor(private readonly ticketMessageService: TicketMessageService) {}

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

  public listMessages = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const lawyerId = this.getLawyerId(req);

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
      const lawyerId = this.getLawyerId(req);

      const { id } = ParamTicketIdSchema.parse(req.params);

      const input = CreateTicketMessageSchema.parse(req.body ?? {});

      const message = await this.ticketMessageService.addLawyerMessage(
        lawyerId,
        id,
        input,
      );

      return res.status(201).json({
        success: true,

        data: message,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default TicketMessageController;
