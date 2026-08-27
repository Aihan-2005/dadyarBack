import type { CreateTicketData, Ticket } from "../interfaces/ticket.interface";

import { TicketModel } from "../models/ticket.model";

import { BaseRepository } from "./base.repository";

export class TicketRepository extends BaseRepository<Ticket> {
  constructor() {
    super(TicketModel);
  }

  public findByLawyerId(lawyerId: string) {
    return this.model
      .find({
        lawyerId: this.toObjectId(lawyerId),
      })
      .sort({
        createdAt: -1,
      })
      .lean()
      .exec();
  }

  public findByIdForLawyer(lawyerId: string, ticketId: string) {
    return this.model
      .findOne({
        _id: this.toObjectId(ticketId),

        lawyerId: this.toObjectId(lawyerId),
      })
      .lean()
      .exec();
  }

  public create(lawyerId: string, data: CreateTicketData) {
    return this.model.create({
      ...data,

      lawyerId: this.toObjectId(lawyerId),

      attachmentId: data.attachmentId
        ? this.toObjectId(data.attachmentId)
        : undefined,
    });
  }
}
