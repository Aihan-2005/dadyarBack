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

  public create(data: CreateTicketMessageData) {
    return this.model.create({
      ...data,

      ticketId: this.toObjectId(data.ticketId),

      senderId: this.toObjectId(data.senderId),
    });
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
}
