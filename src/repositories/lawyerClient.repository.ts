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

  public findByIdForLawyerInternal(
    lawyerId: string,

    clientId: string,

    session?: ClientSession,
  ) {
    const query = this.model.findOne({
      _id: this.toObjectId(clientId),

      lawyerId: this.toObjectId(lawyerId),
    });

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

  public findByPhoneForConnection(
    lawyerId: string,

    phone: string,

    session?: ClientSession,
  ) {
    const query = this.model.findOne({
      lawyerId: this.toObjectId(lawyerId),

      phone,
    });

    if (session) {
      query.session(session);
    }

    return query.lean<LawyerClientRecord>().exec();
  }

  public findByUserIdForLawyer(
    lawyerId: string,

    userId: string,

    session?: ClientSession,
  ) {
    const query = this.model.findOne({
      lawyerId: this.toObjectId(lawyerId),

      userId: this.toObjectId(userId),
    });

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

  public async createLinked(
    lawyerId: string,

    data: CreateLawyerClientRecordInput,

    session: ClientSession,
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

    return created.toObject() as unknown as LawyerClientRecord;
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
          returnDocument: "after",

          runValidators: true,

          session,
        },
      )
      .select("-userId")
      .lean<LawyerClientRecord>()
      .exec();
  }

  public linkByIdToUser(
    lawyerId: string,

    clientId: string,

    userId: string,

    session: ClientSession,
  ) {
    const userObjectId = this.toObjectId(userId);

    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(clientId),

          lawyerId: this.toObjectId(lawyerId),

          $or: [
            {
              userId: {
                $exists: false,
              },
            },

            {
              userId: userObjectId,
            },
          ],
        },

        {
          $set: {
            userId: userObjectId,
          },
        },

        {
          returnDocument: "after",

          runValidators: true,

          session,
        },
      )
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

  public findByUserId(
    userId: string,

    session?: ClientSession,
  ) {
    const query = this.model.find({
      userId: this.toObjectId(userId),
    });

    if (session) {
      query.session(session);
    }

    return query.lean<LawyerClientRecord[]>().exec();
  }

  public async linkUnlinkedByPhoneToUser(
    phone: string,

    userId: string,

    session?: ClientSession,
  ) {
    const userObjectId = this.toObjectId(userId);

    const candidatesQuery = this.model.find({
      phone,

      userId: {
        $exists: false,
      },
    });

    if (session) {
      candidatesQuery.session(session);
    }

    const candidates = await candidatesQuery
      .lean<LawyerClientRecord[]>()
      .exec();

    let modifiedCount = 0;

    for (const candidate of candidates) {
      const existingQuery = this.model.findOne({
        lawyerId: candidate.lawyerId,

        userId: userObjectId,
      });

      if (session) {
        existingQuery.session(session);
      }

      const existing = await existingQuery.select("_id").lean().exec();

      if (existing) {
        continue;
      }

      const result = await this.model
        .updateOne(
          {
            _id: candidate._id,

            userId: {
              $exists: false,
            },
          },

          {
            $set: {
              userId: userObjectId,
            },
          },

          {
            session,
          },
        )
        .exec();

      modifiedCount += result.modifiedCount;
    }

    return {
      matchedCount: candidates.length,

      modifiedCount,
    };
  }
}
