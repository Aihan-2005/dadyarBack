import type { ClientSession } from "mongoose";
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

  public async create(
    lawyerId: string,
    data: CreateTicketData,
    session?: ClientSession,
  ) {
    const createData = {
      ...data,

      lawyerId: this.toObjectId(lawyerId),

      attachmentId: data.attachmentId
        ? this.toObjectId(data.attachmentId)
        : undefined,
    };

    if (!session) {
      return this.model.create(createData);
    }

    const [ticket] = await this.model.create([createData], {
      session,
    });

    return ticket;
  }
}
