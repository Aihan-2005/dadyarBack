import type { ClientSession } from "mongoose";
import type {
  CreateTicketMessageData,
  TicketMessage,
} from "../interfaces/ticketMessage.interface";

import { TicketMessageModel } from "../models/ticketMessage.model";

import { BaseRepository } from "./base.repository";

export class TicketMessageRepository extends BaseRepository<TicketMessage> {
  constructor() {
    super(TicketMessageModel);
  }

  public async create(data: CreateTicketMessageData, session?: ClientSession) {
    const createData = {
      ...data,

      ticketId: this.toObjectId(data.ticketId),

      senderId: this.toObjectId(data.senderId),

      attachmentId: data.attachmentId
        ? this.toObjectId(data.attachmentId)
        : undefined,
    };

    if (!session) {
      return this.model.create(createData);
    }

    const [message] = await this.model.create([createData], {
      session,
    });

    return message;
  }

  public findByTicketId(ticketId: string) {
    return this.model
      .find({
        ticketId: this.toObjectId(ticketId),
      })
      .sort({
        createdAt: 1,
      })
      .lean()
      .exec();
  }

  public findByIdForTicket(ticketId: string, messageId: string) {
    return this.model
      .findOne({
        _id: this.toObjectId(messageId),

        ticketId: this.toObjectId(ticketId),
      })
      .lean()
      .exec();
  }
}
