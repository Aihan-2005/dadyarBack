import {
  QueryFilter,
  Types,
  type UpdateQuery,
} from "mongoose";

import {
  ONLINE_CONTRACT_STATUSES,
} from "../constants/onlineContract.constants";

import type {
  CreatePersistedOnlineContractInput,
  OnlineContract,
  OnlineContractAuditEventData,
  OnlineContractDraftData,
  OnlineContractListOptions,
  OnlineContractRecord,
  OnlineContractVersionData,
} from "../interfaces/onlineContract.interface";

import {
  OnlineContractModel,
} from "../models/onlineContract.model";


export class OnlineContractRepository {
  private readonly model =
    OnlineContractModel;


  private toObjectId(
    value:
      string,
  ): Types.ObjectId {
    return new Types.ObjectId(
      value,
    );
  }


  private escapeRegex(
    value:
      string,
  ): string {
    return value.replace(
      /[.*+?^${}()|[\]\\]/g,

      "\\$&",
    );
  }


  private buildListFilter(
    ownerField:
      | "clientId"
      | "lawyerId",

    ownerId:
      string,

    options:
      OnlineContractListOptions,
  ): QueryFilter<OnlineContract> {
    /*
     * Mongoose 9:
     * FilterQuery -> QueryFilter
     *
     * برای dot-pathهای nested یک cast محدود در boundary
     * Repository داریم، نه در کل domain.
     */
    const filter:
      Record<
        string,
        unknown
      > = {
        [ownerField]:
          this.toObjectId(
            ownerId,
          ),
      };


    if (
      options.status
    ) {
      filter.status =
        options.status;
    }


    const search =
      options.search?.trim();


    if (
      search
    ) {
      const regex =
        new RegExp(
          this.escapeRegex(
            search,
          ),

          "i",
        );


      filter.$or = [
        {
          reference:
            regex,
        },

        {
          "draft.subject":
            regex,
        },

        {
          "draft.client.fullName":
            regex,
        },

        {
          "draft.client.phone":
            regex,
        },

        {
          "draft.lawyer.fullName":
            regex,
        },
      ];
    }


    return filter as
      QueryFilter<OnlineContract>;
  }


  public async createContract(
    input:
      CreatePersistedOnlineContractInput,
  ): Promise<OnlineContractRecord> {
    const created =
      await this.model.create({
        clientId:
          this.toObjectId(
            input.clientId,
          ),

        lawyerId:
          this.toObjectId(
            input.lawyerId,
          ),

        reference:
          input.reference,

        status:
          input.status,

        templateSnapshot:
          input.templateSnapshot,

        draft:
          input.draft,

        version:
          input.version,

        versions:
          input.versions,

        auditTrail:
          input.auditTrail,

        completedAt:
          null,

        rejectionReason:
          null,

        clientFeedback:
          null,
      });


    return created.toObject() as
      unknown as OnlineContractRecord;
  }


  public listForClient(
    clientId:
      string,

    options:
      OnlineContractListOptions,
  ): Promise<
    OnlineContractRecord[]
  > {
    const skip =
      (
        options.page -
        1
      ) *
      options.limit;


    return this.model
      .find(
        this.buildListFilter(
          "clientId",

          clientId,

          options,
        ),
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
        OnlineContractRecord[]
      >()
      .exec();
  }


  public countForClient(
    clientId:
      string,

    options:
      OnlineContractListOptions,
  ): Promise<number> {
    return this.model
      .countDocuments(
        this.buildListFilter(
          "clientId",

          clientId,

          options,
        ),
      )
      .exec();
  }


  public listForLawyer(
    lawyerId:
      string,

    options:
      OnlineContractListOptions,
  ): Promise<
    OnlineContractRecord[]
  > {
    const skip =
      (
        options.page -
        1
      ) *
      options.limit;


    return this.model
      .find(
        this.buildListFilter(
          "lawyerId",

          lawyerId,

          options,
        ),
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
        OnlineContractRecord[]
      >()
      .exec();
  }


  public countForLawyer(
    lawyerId:
      string,

    options:
      OnlineContractListOptions,
  ): Promise<number> {
    return this.model
      .countDocuments(
        this.buildListFilter(
          "lawyerId",

          lawyerId,

          options,
        ),
      )
      .exec();
  }


  public findByIdForClient(
    clientId:
      string,

    contractId:
      string,
  ): Promise<
    OnlineContractRecord | null
  > {
    return this.model
      .findOne({
        _id:
          this.toObjectId(
            contractId,
          ),

        clientId:
          this.toObjectId(
            clientId,
          ),
      })
      .lean<
        OnlineContractRecord
      >()
      .exec();
  }


  public findByIdForLawyer(
    lawyerId:
      string,

    contractId:
      string,
  ): Promise<
    OnlineContractRecord | null
  > {
    return this.model
      .findOne({
        _id:
          this.toObjectId(
            contractId,
          ),

        lawyerId:
          this.toObjectId(
            lawyerId,
          ),
      })
      .lean<
        OnlineContractRecord
      >()
      .exec();
  }


  public reviewForLawyer(
    lawyerId:
      string,

    contractId:
      string,

    expectedVersion:
      number,

    draft:
      OnlineContractDraftData,

    version:
      OnlineContractVersionData,

    auditEvents:
      OnlineContractAuditEventData[],
  ): Promise<
    OnlineContractRecord | null
  > {
    const update:
      UpdateQuery<OnlineContract> = {
        $set: {
          draft,

          version:
            version.version,

          status:
            ONLINE_CONTRACT_STATUSES
              .WAITING_CLIENT_APPROVAL,

          clientFeedback:
            null,

          rejectionReason:
            null,
        },

        $push: {
          versions:
            version,

          auditTrail: {
            $each:
              auditEvents,
          },
        },
      };


    return this.model
      .findOneAndUpdate(
        {
          _id:
            this.toObjectId(
              contractId,
            ),

          lawyerId:
            this.toObjectId(
              lawyerId,
            ),

          status:
            ONLINE_CONTRACT_STATUSES
              .WAITING_LAWYER_REVIEW,

          version:
            expectedVersion,
        },

        update,

        {
          new:
            true,

          runValidators:
            true,
        },
      )
      .lean<
        OnlineContractRecord
      >()
      .exec();
  }


  public approveForClient(
    clientId:
      string,

    contractId:
      string,

    expectedVersion:
      number,

    auditEvent:
      OnlineContractAuditEventData,
  ): Promise<
    OnlineContractRecord | null
  > {
    const update:
      UpdateQuery<OnlineContract> = {
        $set: {
          status:
            ONLINE_CONTRACT_STATUSES
              .WAITING_LAWYER_SIGNATURE,

          clientFeedback:
            null,
        },

        $push: {
          auditTrail:
            auditEvent,
        },
      };


    return this.model
      .findOneAndUpdate(
        {
          _id:
            this.toObjectId(
              contractId,
            ),

          clientId:
            this.toObjectId(
              clientId,
            ),

          status:
            ONLINE_CONTRACT_STATUSES
              .WAITING_CLIENT_APPROVAL,

          version:
            expectedVersion,
        },

        update,

        {
          new:
            true,

          runValidators:
            true,
        },
      )
      .lean<
        OnlineContractRecord
      >()
      .exec();
  }


  public requestChangesForClient(
    clientId:
      string,

    contractId:
      string,

    expectedVersion:
      number,

    feedback:
      string,

    auditEvent:
      OnlineContractAuditEventData,
  ): Promise<
    OnlineContractRecord | null
  > {
    const update:
      UpdateQuery<OnlineContract> = {
        $set: {
          status:
            ONLINE_CONTRACT_STATUSES
              .WAITING_LAWYER_REVIEW,

          clientFeedback:
            feedback,
        },

        $push: {
          auditTrail:
            auditEvent,
        },
      };


    return this.model
      .findOneAndUpdate(
        {
          _id:
            this.toObjectId(
              contractId,
            ),

          clientId:
            this.toObjectId(
              clientId,
            ),

          status:
            ONLINE_CONTRACT_STATUSES
              .WAITING_CLIENT_APPROVAL,

          version:
            expectedVersion,
        },

        update,

        {
          new:
            true,

          runValidators:
            true,
        },
      )
      .lean<
        OnlineContractRecord
      >()
      .exec();
  }


  public signForLawyer(
    lawyerId:
      string,

    contractId:
      string,

    expectedVersion:
      number,

    completedAt:
      Date,

    auditEvent:
      OnlineContractAuditEventData,
  ): Promise<
    OnlineContractRecord | null
  > {
    const update:
      UpdateQuery<OnlineContract> = {
        $set: {
          status:
            ONLINE_CONTRACT_STATUSES
              .COMPLETED,

          completedAt,
        },

        $push: {
          auditTrail:
            auditEvent,
        },
      };


    return this.model
      .findOneAndUpdate(
        {
          _id:
            this.toObjectId(
              contractId,
            ),

          lawyerId:
            this.toObjectId(
              lawyerId,
            ),

          status:
            ONLINE_CONTRACT_STATUSES
              .WAITING_LAWYER_SIGNATURE,

          version:
            expectedVersion,
        },

        update,

        {
          new:
            true,

          runValidators:
            true,
        },
      )
      .lean<
        OnlineContractRecord
      >()
      .exec();
  }


  public rejectForLawyer(
    lawyerId:
      string,

    contractId:
      string,

    expectedVersion:
      number,

    reason:
      string,

    auditEvent:
      OnlineContractAuditEventData,
  ): Promise<
    OnlineContractRecord | null
  > {
    const update:
      UpdateQuery<OnlineContract> = {
        $set: {
          status:
            ONLINE_CONTRACT_STATUSES
              .REJECTED,

          rejectionReason:
            reason,
        },

        $push: {
          auditTrail:
            auditEvent,
        },
      };


    return this.model
      .findOneAndUpdate(
        {
          _id:
            this.toObjectId(
              contractId,
            ),

          lawyerId:
            this.toObjectId(
              lawyerId,
            ),

          status:
            ONLINE_CONTRACT_STATUSES
              .WAITING_LAWYER_REVIEW,

          version:
            expectedVersion,
        },

        update,

        {
          new:
            true,

          runValidators:
            true,
        },
      )
      .lean<
        OnlineContractRecord
      >()
      .exec();
  }
}