import mongoose from "mongoose";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";

import { HttpException } from "../exceptions/httpException";

import type { UploadAttachmentInput } from "../interfaces/attachment.interface";

import type { CreateTicketInput } from "../interfaces/ticket.interface";

import { TicketRepository } from "../repositories/ticket.repository";

import { AttachmentService } from "./attachment.service";

const LANGUAGE = env.LANGUAGE;

export class TicketService {
  constructor(
    private readonly ticketRepository = new TicketRepository(),

    private readonly attachmentService = new AttachmentService(),
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
        let attachmentId: string | undefined;

        if (uploadedAttachment) {
          const createdAttachment =
            await this.attachmentService.createAttachmentRecord(
              uploadedAttachment,
              session,
            );

          attachmentId = createdAttachment._id.toString();
        }

        return this.ticketRepository.create(
          lawyerId,
          {
            ...data,

            ...(attachmentId
              ? {
                  attachmentId,
                }
              : {}),
          },
          session,
        );
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

  public async getAttachmentDownloadUrl(lawyerId: string, ticketId: string) {
    const ticket = await this.ensureTicketBelongsToLawyer(lawyerId, ticketId);

    if (!ticket.attachmentId) {
      throw new HttpException(
        404,
        MESSAGES.ticketAttachmentNotFound[LANGUAGE],
        "TICKET_ATTACHMENT_NOT_FOUND",
      );
    }

    return this.attachmentService.getDownloadUrl(
      ticket.attachmentId.toString(),
    );
  }
}
