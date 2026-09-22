import type { ClientSession } from "mongoose";

import { ConsultationBooking } from "../models/consultationBooking.model";

import type { ConsultationBookingStatus } from "../constants/consultationBooking.constants";

import type { IConsultationBooking } from "../interfaces/consultationBooking.interface";

export class ConsultationBookingRepository {
  public async create(
    data: IConsultationBooking,

    session?: ClientSession,
  ) {
    if (!session) {
      return ConsultationBooking.create(data);
    }

    const [created] = await ConsultationBooking.create(
      [data],

      {
        session,
      },
    );

    return created;
  }

  public findByClient(clientId: string) {
    return ConsultationBooking.find({
      clientId,
    })
      .sort({
        createdAt: -1,
      })
      .exec();
  }

  public findByLawyer(lawyerId: string) {
    return ConsultationBooking.find({
      lawyerId,
    })
      .sort({
        createdAt: -1,
      })
      .exec();
  }

  public findById(
    id: string,

    session?: ClientSession,
  ) {
    const query = ConsultationBooking.findById(id);

    if (session) {
      query.session(session);
    }

    return query.exec();
  }

  public updateStatusForClient(
    id: string,

    clientId: string,

    allowedCurrentStatuses: ConsultationBookingStatus[],

    status: ConsultationBookingStatus,

    session?: ClientSession,
  ) {
    return ConsultationBooking.findOneAndUpdate(
      {
        _id: id,

        clientId,

        status: {
          $in: allowedCurrentStatuses,
        },
      },

      {
        $set: {
          status,
        },
      },

      {
        returnDocument: "after",

        runValidators: true,

        session,
      },
    ).exec();
  }

  public updateStatusForLawyer(
    id: string,

    lawyerId: string,

    allowedCurrentStatuses: ConsultationBookingStatus[],

    status: ConsultationBookingStatus,

    session?: ClientSession,
  ) {
    return ConsultationBooking.findOneAndUpdate(
      {
        _id: id,

        lawyerId,

        status: {
          $in: allowedCurrentStatuses,
        },
      },

      {
        $set: {
          status,
        },
      },

      {
        returnDocument: "after",

        runValidators: true,

        session,
      },
    ).exec();
  }
}
