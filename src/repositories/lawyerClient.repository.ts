import type { ClientSession, QueryFilter, UpdateQuery } from "mongoose";

import type {
  LawyerClient,
  LawyerClientRecord,
  CreateLawyerClientRecordInput,
  FindLawyerClientsOptions,
} from "../interfaces/lawyerClient.interface";

import { LawyerClientModel } from "../models/lawyerClient.model";

import { BaseRepository } from "./base.repository";

export class LawyerClientRepository extends BaseRepository<LawyerClient> {
  constructor() {
    super(LawyerClientModel);
  }

  private escapeRegex(value: string) {
    return value.replace(
      /[.*+?^${}()|[\]\\]/g,

      "\\$&",
    );
  }

  private buildSearchQuery(
    lawyerId: string,

    search?: string,
  ): QueryFilter<LawyerClient> {
    const query: QueryFilter<LawyerClient> = {
      lawyerId: this.toObjectId(lawyerId),
    };

    const normalizedSearch = search?.trim();

    if (!normalizedSearch) {
      return query;
    }

    const safeSearch = this.escapeRegex(normalizedSearch);

    query.$or = [
      {
        fullName: {
          $regex: safeSearch,

          $options: "i",
        },
      },

      {
        phone: {
          $regex: safeSearch,

          $options: "i",
        },
      },

      {
        nationalId: {
          $regex: safeSearch,

          $options: "i",
        },
      },

      {
        homeNumber: {
          $regex: safeSearch,

          $options: "i",
        },
      },
    ];

    return query;
  }

  public findByIdForLawyer(
    lawyerId: string,

    clientId: string,

    session?: ClientSession,
  ) {
    const query = this.model
      .findOne({
        _id: this.toObjectId(clientId),

        lawyerId: this.toObjectId(lawyerId),
      })
      .select("-userId");

    if (session) {
      query.session(session);
    }

    return query.lean<LawyerClientRecord>().exec();
  }

  public findByPhone(
    lawyerId: string,

    phone: string,

    session?: ClientSession,
  ) {
    const query = this.model
      .findOne({
        lawyerId: this.toObjectId(lawyerId),

        phone,
      })

      .select("-userId");

    if (session) {
      query.session(session);
    }

    return query.lean<LawyerClientRecord>().exec();
  }

  public findByNationalId(
    lawyerId: string,

    nationalId: string,

    session?: ClientSession,
  ) {
    const query = this.model
      .findOne({
        lawyerId: this.toObjectId(lawyerId),

        nationalId,
      })
      .select("-userId");

    if (session) {
      query.session(session);
    }

    return query.lean<LawyerClientRecord>().exec();
  }

  public findByLawyerId(
    lawyerId: string,

    options: FindLawyerClientsOptions = {},
  ) {
    const page = options.page ?? 1;

    const limit = options.limit ?? 10;

    const skip = (page - 1) * limit;

    const query = this.buildSearchQuery(
      lawyerId,

      options.search,
    );

    return this.model
      .find(query)

      .select("-userId")

      .sort({
        updatedAt: -1,
      })

      .skip(skip)

      .limit(limit)

      .lean<LawyerClientRecord[]>()

      .exec();
  }

  public countByLawyerId(
    lawyerId: string,

    options: FindLawyerClientsOptions = {},
  ) {
    const query = this.buildSearchQuery(
      lawyerId,

      options.search,
    );

    return this.model.countDocuments(query).exec();
  }

  public async create(
    lawyerId: string,

    data: CreateLawyerClientRecordInput,

    session?: ClientSession,
  ): Promise<LawyerClientRecord> {
    const [created] = await this.model.create(
      [
        {
          ...data,

          lawyerId: this.toObjectId(lawyerId),
        },
      ],

      {
        session,
      },
    );

    const record = created.toObject() as unknown as LawyerClientRecord;

    delete record.userId;

    return record;
  }

  public updateByIdForLawyer(
    lawyerId: string,

    clientId: string,

    update: UpdateQuery<LawyerClient>,

    session?: ClientSession,
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(clientId),

          lawyerId: this.toObjectId(lawyerId),
        },

        update,

        {
          new: true,

          runValidators: true,

          session,
        },
      )

      .select("-userId")

      .lean<LawyerClientRecord>()

      .exec();
  }

  public findByIdForLawyerWithPersonalPassword(
    lawyerId: string,
    clientId: string,
    session?: ClientSession,
  ) {
    const query = this.model
      .findOne({
        _id: this.toObjectId(clientId),

        lawyerId: this.toObjectId(lawyerId),
      })
      .select("+personalPassword -userId");

    if (session) {
      query.session(session);
    }

    return query.lean<LawyerClientRecord>().exec();
  }

  public findByUserId(userId: string, session?: ClientSession) {
    const query = this.model.find({
      userId: this.toObjectId(userId),
    });

    if (session) {
      query.session(session);
    }

    return query.lean<LawyerClientRecord[]>().exec();
  }

  public linkUnlinkedByPhoneToUser(
    phone: string,
    userId: string,
    session?: ClientSession,
  ) {
    return this.model
      .updateMany(
        {
          phone,

          userId: {
            $exists: false,
          },
        },

        {
          $set: {
            userId: this.toObjectId(userId),
          },
        },

        {
          session,
        },
      )
      .exec();
  }
}
