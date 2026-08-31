import type { ClientSession, QueryFilter, UpdateQuery } from "mongoose";

import type {
  Client,
  ClientRecord,
  CreateClientRecordInput,
  FindClientsOptions,
} from "../interfaces/client.interface";

import ClientModel from "../models/client.model";

import { BaseRepository } from "./base.repository";

export class ClientRepository extends BaseRepository<Client> {
  constructor() {
    super(ClientModel);
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
  ): QueryFilter<Client> {
    const query: QueryFilter<Client> = {
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
    const query = this.model.findOne({
      _id: this.toObjectId(clientId),

      lawyerId: this.toObjectId(lawyerId),
    });

    if (session) {
      query.session(session);
    }

    return query.lean<ClientRecord>().exec();
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

      .select("-personalPasswordHash");

    if (session) {
      query.session(session);
    }

    return query.lean<ClientRecord>().exec();
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

      .select("-personalPasswordHash");

    if (session) {
      query.session(session);
    }

    return query.lean<ClientRecord>().exec();
  }

  public findByLawyerId(
    lawyerId: string,

    options: FindClientsOptions = {},
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

      .select("-personalPasswordHash")

      .sort({
        updatedAt: -1,
      })

      .skip(skip)

      .limit(limit)

      .lean<ClientRecord[]>()

      .exec();
  }

  public countByLawyerId(
    lawyerId: string,

    options: FindClientsOptions = {},
  ) {
    const query = this.buildSearchQuery(
      lawyerId,

      options.search,
    );

    return this.model.countDocuments(query).exec();
  }

  public async create(
    lawyerId: string,

    data: CreateClientRecordInput,

    session?: ClientSession,
  ): Promise<ClientRecord> {
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

    return created.toObject() as unknown as ClientRecord;
  }

  public updateByIdForLawyer(
    lawyerId: string,

    clientId: string,

    update: UpdateQuery<Client>,

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

      .lean<ClientRecord>()

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
      .select("+personalPassword");

    if (session) {
      query.session(session);
    }

    return query.lean<ClientRecord>().exec();
  }
}
