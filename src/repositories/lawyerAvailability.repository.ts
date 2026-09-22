import type { ClientSession, QueryFilter, UpdateQuery } from "mongoose";

import { LawyerAvailabilityModel } from "../models/lawyerAvailability.model";

import type {
  LawyerAvailability,
  LawyerAvailabilityRecord,
} from "../interfaces/lawyerAvailability.interface";

import type { ConsultationType } from "../constants/consultationBooking.constants";

import { BaseRepository } from "./base.repository";

export class LawyerAvailabilityRepository extends BaseRepository<LawyerAvailability> {
  constructor() {
    super(LawyerAvailabilityModel);
  }

  public async createForLawyer(
    lawyerId: string,

    input: {
      startsAt: Date;

      endsAt: Date;

      consultationTypes: ConsultationType[];

      note?: string;

      isActive: boolean;
    },
  ): Promise<LawyerAvailabilityRecord> {
    const created = await this.model.create({
      lawyerId: this.toObjectId(lawyerId),

      startsAt: input.startsAt,

      endsAt: input.endsAt,

      consultationTypes: input.consultationTypes,

      note: input.note ?? "",

      isActive: input.isActive,

      isReserved: false,
    });

    return created.toObject() as unknown as LawyerAvailabilityRecord;
  }

  public findByIdForLawyer(
    lawyerId: string,

    availabilityId: string,
  ) {
    return this.model
      .findOne({
        _id: this.toObjectId(availabilityId),

        lawyerId: this.toObjectId(lawyerId),
      })
      .lean<LawyerAvailabilityRecord>()
      .exec();
  }

  public findAvailableById(
    availabilityId: string,

    session?: ClientSession,
  ) {
    const query = this.model.findOne({
      _id: this.toObjectId(availabilityId),

      isActive: true,

      isReserved: false,
    });

    if (session) {
      query.session(session);
    }

    return query.lean<LawyerAvailabilityRecord>().exec();
  }

  public listForLawyer(
    lawyerId: string,

    options: {
      from: Date;

      to: Date;

      includeInactive: boolean;
    },
  ) {
    const query: QueryFilter<LawyerAvailability> = {
      lawyerId: this.toObjectId(lawyerId),

      startsAt: {
        $gte: options.from,

        $lt: options.to,
      },

      ...(options.includeInactive
        ? {}
        : {
            isActive: true,
          }),
    };

    return this.model
      .find(query)
      .sort({
        startsAt: 1,
      })
      .lean<LawyerAvailabilityRecord[]>()
      .exec();
  }

  public listAvailableForClient(
    lawyerId: string,

    options: {
      from: Date;

      to: Date;

      type?: ConsultationType;
    },
  ) {
    return this.model
      .find({
        lawyerId: this.toObjectId(lawyerId),

        isActive: true,

        isReserved: false,

        startsAt: {
          $gte: options.from,

          $lt: options.to,
        },

        ...(options.type
          ? {
              consultationTypes: options.type,
            }
          : {}),
      })
      .sort({
        startsAt: 1,
      })
      .lean<LawyerAvailabilityRecord[]>()
      .exec();
  }

  public findOverlap(
    lawyerId: string,

    startsAt: Date,

    endsAt: Date,

    excludeId?: string,
  ) {
    return this.model
      .findOne({
        lawyerId: this.toObjectId(lawyerId),

        isActive: true,

        startsAt: {
          $lt: endsAt,
        },

        endsAt: {
          $gt: startsAt,
        },

        ...(excludeId
          ? {
              _id: {
                $ne: this.toObjectId(excludeId),
              },
            }
          : {}),
      })
      .lean<LawyerAvailabilityRecord>()
      .exec();
  }

  public updateUnreservedForLawyer(
    lawyerId: string,

    availabilityId: string,

    update: UpdateQuery<LawyerAvailability>,
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(availabilityId),

          lawyerId: this.toObjectId(lawyerId),

          isReserved: false,
        },

        update,

        {
          returnDocument: "after",

          runValidators: true,
        },
      )
      .lean<LawyerAvailabilityRecord>()
      .exec();
  }

  public deleteUnreservedForLawyer(
    lawyerId: string,

    availabilityId: string,
  ) {
    return this.model
      .findOneAndDelete({
        _id: this.toObjectId(availabilityId),

        lawyerId: this.toObjectId(lawyerId),

        isReserved: false,
      })
      .lean<LawyerAvailabilityRecord>()
      .exec();
  }

  public claimSlot(
    lawyerId: string,

    availabilityId: string,

    consultationType: ConsultationType,

    session?: ClientSession,
  ) {
    const now = new Date();

    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(availabilityId),

          lawyerId: this.toObjectId(lawyerId),

          isActive: true,

          isReserved: false,

          startsAt: {
            $gt: now,
          },

          consultationTypes: consultationType,
        },

        {
          $set: {
            isReserved: true,
          },
        },

        {
          returnDocument: "after",

          runValidators: true,

          session,
        },
      )
      .lean<LawyerAvailabilityRecord>()
      .exec();
  }

  public releaseSlot(
    availabilityId: string,

    session?: ClientSession,
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(availabilityId),

          isReserved: true,
        },

        {
          $set: {
            isReserved: false,
          },
        },

        {
          returnDocument: "after",

          runValidators: true,

          session,
        },
      )
      .lean<LawyerAvailabilityRecord>()
      .exec();
  }
}
