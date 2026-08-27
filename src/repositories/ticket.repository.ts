import type { ClientSession } from "mongoose";
import type { CreateTicketData, Ticket } from "../interfaces/ticket.interface";
import type { TicketStatus } from "../constants/ticket.constants";

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

  public findAll() {
    return this.model
      .find()
      .sort({
        createdAt: -1,
      })
      .lean()
      .exec();
  }

  public findById(ticketId: string) {
    return this.model.findById(this.toObjectId(ticketId)).lean().exec();
  }

  public updateStatus(ticketId: string, status: TicketStatus) {
    return this.model
      .findByIdAndUpdate(
        this.toObjectId(ticketId),
        {
          $set: {
            status,
          },
        },
        {
          new: true,
          runValidators: true,
        },
      )
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
