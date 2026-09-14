import type {
  UpdateQuery,
} from "mongoose";

import type {
  ClientPetition,
  ClientPetitionListOptions,
  ClientPetitionRecord,
  CreateClientPetitionInput,
} from "../interfaces/clientPetition.interface";

import {
  ClientPetitionModel,
} from "../models/clientPetition.model";

import {
  BaseRepository,
} from "./base.repository";


export class ClientPetitionRepository
  extends BaseRepository<ClientPetition> {

  constructor() {
    super(
      ClientPetitionModel,
    );
  }


  private buildListQuery(
    clientId: string,

    options:
      ClientPetitionListOptions,
  ) {
    const search =
      this.escapeRegex(
        options.search ??
          "",
      );

    return {
      clientId:
        this.toObjectId(
          clientId,
        ),

      ...(options.status
        ? {
            status:
              options.status,
          }
        : {}),

      ...(search
        ? {
            $or: [
              {
                title: {
                  $regex:
                    search,

                  $options:
                    "i",
                },
              },

              {
                caseNumber: {
                  $regex:
                    search,

                  $options:
                    "i",
                },
              },

              {
                subject: {
                  $regex:
                    search,

                  $options:
                    "i",
                },
              },

              {
                court: {
                  $regex:
                    search,

                  $options:
                    "i",
                },
              },
            ],
          }
        : {}),
    };
  }


  public async createForClient(
    clientId: string,

    input:
      CreateClientPetitionInput,
  ): Promise<ClientPetitionRecord> {
    const created =
      await this.model.create({
        clientId:
          this.toObjectId(
            clientId,
          ),

        title:
          input.title,

        caseNumber:
          input.caseNumber ??
          "",

        court:
          input.court ??
          "",

        subject:
          input.subject ??
          "",

        facts:
          input.facts ??
          "",

        arguments:
          input.arguments ??
          "",

        evidence:
          input.evidence ??
          [],

        requestedRelief:
          input.requestedRelief ??
          "",

        status:
          "DRAFT",

        submittedAt:
          null,
      });

    return created.toObject() as unknown as ClientPetitionRecord;
  }


  public findByIdForClient(
    clientId: string,

    petitionId: string,
  ) {
    return this.model
      .findOne({
        _id:
          this.toObjectId(
            petitionId,
          ),

        clientId:
          this.toObjectId(
            clientId,
          ),
      })
      .lean<ClientPetitionRecord>()
      .exec();
  }


  public listForClient(
    clientId: string,

    options:
      ClientPetitionListOptions,
  ) {
    const query =
      this.buildListQuery(
        clientId,

        options,
      );

    const skip =
      (
        options.page -
        1
      ) *
      options.limit;

    return this.model
      .find(
        query,
      )
      .sort({
        updatedAt:
          -1,
      })
      .skip(
        skip,
      )
      .limit(
        options.limit,
      )
      .lean<
        ClientPetitionRecord[]
      >()
      .exec();
  }


  public countForClient(
    clientId: string,

    options:
      ClientPetitionListOptions,
  ) {
    const query =
      this.buildListQuery(
        clientId,

        options,
      );

    return this.model
      .countDocuments(
        query,
      )
      .exec();
  }


  public updateDraftForClient(
    clientId: string,

    petitionId: string,

    update:
      UpdateQuery<ClientPetition>,
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id:
            this.toObjectId(
              petitionId,
            ),

          clientId:
            this.toObjectId(
              clientId,
            ),

          status:
            "DRAFT",
        },

        update,

        {
          new:
            true,

          runValidators:
            true,
        },
      )
      .lean<ClientPetitionRecord>()
      .exec();
  }


  public submitDraftForClient(
    clientId: string,

    petitionId: string,
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id:
            this.toObjectId(
              petitionId,
            ),

          clientId:
            this.toObjectId(
              clientId,
            ),

          status:
            "DRAFT",
        },

        {
          $set: {
            status:
              "SUBMITTED",

            submittedAt:
              new Date(),
          },
        },

        {
          new:
            true,

          runValidators:
            true,
        },
      )
      .lean<ClientPetitionRecord>()
      .exec();
  }


  public archiveForClient(
    clientId: string,

    petitionId: string,
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id:
            this.toObjectId(
              petitionId,
            ),

          clientId:
            this.toObjectId(
              clientId,
            ),

          status:
            "SUBMITTED",
        },

        {
          $set: {
            status:
              "ARCHIVED",
          },
        },

        {
          new:
            true,

          runValidators:
            true,
        },
      )
      .lean<ClientPetitionRecord>()
      .exec();
  }


  public deleteDraftForClient(
    clientId: string,

    petitionId: string,
  ) {
    return this.model
      .findOneAndDelete({
        _id:
          this.toObjectId(
            petitionId,
          ),

        clientId:
          this.toObjectId(
            clientId,
          ),

        status:
          "DRAFT",
      })
      .lean<ClientPetitionRecord>()
      .exec();
  }
}