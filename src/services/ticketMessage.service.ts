import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";

import { HttpException } from "../exceptions/httpException";

import type { CreateTicketMessageInput } from "../interfaces/ticketMessage.interface";

import { TicketMessageRepository } from "../repositories/ticketMessage.repository";

import { TicketRepository } from "../repositories/ticket.repository";

const LANGUAGE = env.LANGUAGE;

export class TicketMessageService {
  constructor(
    private readonly ticketMessageRepository = new TicketMessageRepository(),

    private readonly ticketRepository = new TicketRepository(),
  ) {}

  private async ensureTicketBelongsToLawyer(
    lawyerId: string,
    ticketId: string,
  ) {
    const ticket = await this.ticketRepository.findByIdForLawyer(
      lawyerId,
      ticketId,
    );

    if (!ticket) {
      throw new HttpException(
        404,
        MESSAGES.ticketNotFound[LANGUAGE],
        "TICKET_NOT_FOUND",
      );
    }

    return ticket;
  }

  public async listMessages(lawyerId: string, ticketId: string) {
    await this.ensureTicketBelongsToLawyer(lawyerId, ticketId);

    return this.ticketMessageRepository.findByTicketId(ticketId);
  }

  public async addLawyerMessage(
    lawyerId: string,
    ticketId: string,
    data: CreateTicketMessageInput,
  ) {
    const ticket = await this.ensureTicketBelongsToLawyer(lawyerId, ticketId);

    if (ticket.status === "CLOSED") {
      throw new HttpException(
        409,
        MESSAGES.ticketClosed[LANGUAGE],
        "TICKET_CLOSED",
      );
    }

    return this.ticketMessageRepository.create({
      ...data,

      ticketId,

      senderId: lawyerId,

      senderType: "LAWYER",
    });
  }
}
