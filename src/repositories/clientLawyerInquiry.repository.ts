import type { ClientSession, UpdateQuery } from "mongoose";

import type {
  ClientLawyerInquiry,
  ClientLawyerInquiryListOptions,
  ClientLawyerInquiryRecord,
  CreateClientLawyerInquiryInput,
} from "../interfaces/clientLawyerInquiry.interface";

import { ClientLawyerInquiryModel } from "../models/clientLawyerInquiry.model";

import { BaseRepository } from "./base.repository";

export class ClientLawyerInquiryRepository extends BaseRepository<ClientLawyerInquiry> {
  constructor() {
    super(ClientLawyerInquiryModel);
  }

  private buildListQuery(
    ownerField: "clientId" | "lawyerId",

    ownerId: string,

    options: ClientLawyerInquiryListOptions,
  ) {
    const search = this.escapeRegex(options.search ?? "");

    return {
      [ownerField]: this.toObjectId(ownerId),

      ...(options.status
        ? {
            status: options.status,
          }
        : {}),

      ...(search
        ? {
            $or: [
              {
                subject: {
                  $regex: search,

                  $options: "i",
                },
              },

              {
                description: {
                  $regex: search,

                  $options: "i",
                },
              },

              {
                lawyerResponse: {
                  $regex: search,

                  $options: "i",
                },
              },
            ],
          }
        : {}),
    };
  }

  public createForClient(
    clientId: string,

    input: CreateClientLawyerInquiryInput,
  ) {
    return this.model.create({
      clientId: this.toObjectId(clientId),

      lawyerId: this.toObjectId(input.lawyerId),

      subject: input.subject,

      description: input.description,

      status: "SUBMITTED",

      lawyerResponse: "",

      respondedAt: null,

      cancelledAt: null,

      closedAt: null,
    });
  }

  public findByIdForClient(
    clientId: string,

    inquiryId: string,
  ) {
    return this.model
      .findOne({
        _id: this.toObjectId(inquiryId),

        clientId: this.toObjectId(clientId),
      })
      .lean<ClientLawyerInquiryRecord>()
      .exec();
  }

  public findByIdForLawyer(
    lawyerId: string,

    inquiryId: string,

    session?: ClientSession,
  ) {
    const query = this.model.findOne({
      _id: this.toObjectId(inquiryId),

      lawyerId: this.toObjectId(lawyerId),
    });

    if (session) {
      query.session(session);
    }

    return query.lean<ClientLawyerInquiryRecord>().exec();
  }

  public listForClient(
    clientId: string,

    options: ClientLawyerInquiryListOptions,
  ) {
    const query = this.buildListQuery(
      "clientId",

      clientId,

      options,
    );

    const skip = (options.page - 1) * options.limit;

    return this.model
      .find(query)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(options.limit)
      .lean<ClientLawyerInquiryRecord[]>()
      .exec();
  }

  public countForClient(
    clientId: string,

    options: ClientLawyerInquiryListOptions,
  ) {
    return this.model
      .countDocuments(
        this.buildListQuery(
          "clientId",

          clientId,

          options,
        ),
      )
      .exec();
  }

  public listForLawyer(
    lawyerId: string,

    options: ClientLawyerInquiryListOptions,
  ) {
    const query = this.buildListQuery(
      "lawyerId",

      lawyerId,

      options,
    );

    const skip = (options.page - 1) * options.limit;

    return this.model
      .find(query)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(options.limit)
      .lean<ClientLawyerInquiryRecord[]>()
      .exec();
  }

  public countForLawyer(
    lawyerId: string,

    options: ClientLawyerInquiryListOptions,
  ) {
    return this.model
      .countDocuments(
        this.buildListQuery(
          "lawyerId",

          lawyerId,

          options,
        ),
      )
      .exec();
  }

  public cancelForClient(
    clientId: string,

    inquiryId: string,
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(inquiryId),

          clientId: this.toObjectId(clientId),

          status: {
            $in: ["SUBMITTED", "IN_REVIEW"],
          },
        },

        {
          $set: {
            status: "CANCELLED",

            cancelledAt: new Date(),
          },
        },

        {
          returnDocument: "after",

          runValidators: true,
        },
      )
      .lean<ClientLawyerInquiryRecord>()
      .exec();
  }

  public updateForLawyer(
    lawyerId: string,

    inquiryId: string,

    allowedCurrentStatuses: string[],

    update: UpdateQuery<ClientLawyerInquiry>,

    session?: ClientSession,
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(inquiryId),

          lawyerId: this.toObjectId(lawyerId),

          status: {
            $in: allowedCurrentStatuses,
          },
        },

        update,

        {
          returnDocument: "after",

          runValidators: true,

          session,
        },
      )
      .lean<ClientLawyerInquiryRecord>()
      .exec();
  }
}
