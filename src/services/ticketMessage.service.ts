import mongoose from "mongoose";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";

import { HttpException } from "../exceptions/httpException";

import type {
  CreateTicketMessageData,
  CreateTicketMessageInput,
} from "../interfaces/ticketMessage.interface";

import { TicketMessageRepository } from "../repositories/ticketMessage.repository";

import { TicketRepository } from "../repositories/ticket.repository";

import type { UploadAttachmentInput } from "../interfaces/attachment.interface";

import { AttachmentService } from "./attachment.service";

const LANGUAGE = env.LANGUAGE;

export class TicketMessageService {
  constructor(
    private readonly ticketMessageRepository = new TicketMessageRepository(),

    private readonly ticketRepository = new TicketRepository(),

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

  private async ensureMessageBelongsToTicket(
    ticketId: string,
    messageId: string,
  ) {
    const message = await this.ticketMessageRepository.findByIdForTicket(
      ticketId,
      messageId,
    );

    if (!message) {
      throw new HttpException(
        404,
        MESSAGES.ticketMessageNotFound[LANGUAGE],
        "TICKET_MESSAGE_NOT_FOUND",
      );
    }

    return message;
  }

  private async createMessage(
    data: CreateTicketMessageData,
    attachment?: UploadAttachmentInput,
  ) {
    if (!attachment) {
      return this.ticketMessageRepository.create(data);
    }

    const session = await mongoose.startSession();

    let uploadedAttachment:
      | Awaited<ReturnType<AttachmentService["uploadAttachment"]>>
      | undefined;

    try {
      uploadedAttachment =
        await this.attachmentService.uploadAttachment(attachment);

      return await session.withTransaction(async () => {
        const createdAttachment =
          await this.attachmentService.createAttachmentRecord(
            uploadedAttachment!,
            session,
          );

        return this.ticketMessageRepository.create(
          {
            ...data,

            attachmentId: createdAttachment._id.toString(),
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

  public async listMessages(lawyerId: string, ticketId: string) {
    await this.ensureTicketBelongsToLawyer(lawyerId, ticketId);

    return this.ticketMessageRepository.findByTicketId(ticketId);
  }

  public async addLawyerMessage(
    lawyerId: string,
    ticketId: string,
    data: CreateTicketMessageInput,
    attachment?: UploadAttachmentInput,
  ) {
    const ticket = await this.ensureTicketBelongsToLawyer(lawyerId, ticketId);

    if (ticket.status === "CLOSED") {
      throw new HttpException(
        409,
        MESSAGES.ticketClosed[LANGUAGE],
        "TICKET_CLOSED",
      );
    }

    return this.createMessage(
      {
        ...data,

        ticketId,

        senderId: lawyerId,

        senderType: "LAWYER",
      },
      attachment,
    );
  }

  // -------------------------- Admin ------------------------------

  public async listMessagesForAdmin(ticketId: string) {
    await this.ensureTicketExists(ticketId);

    return this.ticketMessageRepository.findByTicketId(ticketId);
  }

  public async addAdminMessage(
    adminId: string,
    ticketId: string,
    data: CreateTicketMessageInput,
    attachment?: UploadAttachmentInput,
  ) {
    const ticket = await this.ensureTicketExists(ticketId);

    if (ticket.status === "CLOSED") {
      throw new HttpException(
        409,
        MESSAGES.ticketClosed[LANGUAGE],
        "TICKET_CLOSED",
      );
    }

    return this.createMessage(
      {
        ...data,

        ticketId,

        senderId: adminId,

        senderType: "ADMIN",
      },
      attachment,
    );
  }

  public async getAttachmentDownloadUrl(
    lawyerId: string,
    ticketId: string,
    messageId: string,
  ) {
    await this.ensureTicketBelongsToLawyer(lawyerId, ticketId);

    const message = await this.ensureMessageBelongsToTicket(
      ticketId,
      messageId,
    );

    if (!message.attachmentId) {
      throw new HttpException(
        404,
        MESSAGES.ticketMessageAttachmentNotFound[LANGUAGE],
        "TICKET_MESSAGE_ATTACHMENT_NOT_FOUND",
      );
    }

    return this.attachmentService.getDownloadUrl(
      message.attachmentId.toString(),
    );
  }

  public async getAttachmentDownloadUrlForAdmin(
    ticketId: string,
    messageId: string,
  ) {
    await this.ensureTicketExists(ticketId);

    const message = await this.ensureMessageBelongsToTicket(
      ticketId,
      messageId,
    );

    if (!message.attachmentId) {
      throw new HttpException(
        404,
        MESSAGES.ticketMessageAttachmentNotFound[LANGUAGE],
        "TICKET_MESSAGE_ATTACHMENT_NOT_FOUND",
      );
    }

    return this.attachmentService.getDownloadUrl(
      message.attachmentId.toString(),
    );
  }
}
