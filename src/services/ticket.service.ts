import mongoose from "mongoose";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";

import { HttpException } from "../exceptions/httpException";

import type { UploadAttachmentInput } from "../interfaces/attachment.interface";

import type { CreateTicketInput } from "../interfaces/ticket.interface";

import type { TicketStatus } from "../constants/ticket.constants";

import { TicketRepository } from "../repositories/ticket.repository";

import { AttachmentService } from "./attachment.service";
import { TicketMessageRepository } from "../repositories/ticketMessage.repository";

const LANGUAGE = env.LANGUAGE;

export class TicketService {
  constructor(
    private readonly ticketRepository = new TicketRepository(),

    private readonly ticketMessageRepository = new TicketMessageRepository(),

    private readonly attachmentService = new AttachmentService(),
  ) {}

  private async ensureTicketExists(ticketId: string) {
    const ticket = await this.ticketRepository.findById(ticketId);

    if (!ticket) {
      throw new HttpException(
        404,
        MESSAGES.ticketNotFound[LANGUAGE],
        "TICKET_NOT_FOUND",
      );
    }

    return ticket;
  }

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

  public async createTicket(
    lawyerId: string,
    data: CreateTicketInput,
    attachment?: UploadAttachmentInput,
  ) {
    const session = await mongoose.startSession();

    let uploadedAttachment:
      | Awaited<ReturnType<AttachmentService["uploadAttachment"]>>
      | undefined;

    try {
      if (attachment) {
        uploadedAttachment =
          await this.attachmentService.uploadAttachment(attachment);
      }

      return await session.withTransaction(async () => {
        const ticket = await this.ticketRepository.create(
          lawyerId,
          {
            title: data.title,

            type: data.type,
          },
          session,
        );

        let attachmentId: string | undefined;

        if (uploadedAttachment) {
          const createdAttachment =
            await this.attachmentService.createAttachmentRecord(
              uploadedAttachment,
              session,
            );

          attachmentId = createdAttachment._id.toString();
        }

        await this.ticketMessageRepository.create(
          {
            ticketId: ticket._id.toString(),

            senderId: lawyerId,

            senderType: "LAWYER",

            message: data.description,

            ...(attachmentId
              ? {
                  attachmentId,
                }
              : {}),
          },
          session,
        );

        return ticket;
      });
    } catch (error) {
      if (uploadedAttachment) {
        await this.attachmentService
          .deleteStoredAttachment(uploadedAttachment.storageKey)
          .catch(() => undefined);
      }

      throw error;
    } finally {
      await session.endSession();
    }
  }

  public listTickets(lawyerId: string) {
    return this.ticketRepository.findByLawyerId(lawyerId);
  }

  public getTicket(lawyerId: string, ticketId: string) {
    return this.ensureTicketBelongsToLawyer(lawyerId, ticketId);
  }

  // ---------------------------- ADMIN ---------------------------------
  public listAllTickets() {
    return this.ticketRepository.findAll();
  }

  public getTicketById(ticketId: string) {
    return this.ensureTicketExists(ticketId);
  }

  public async updateTicketStatus(ticketId: string, status: TicketStatus) {
    await this.ensureTicketExists(ticketId);

    return this.ticketRepository.updateStatus(ticketId, status);
  }
}
