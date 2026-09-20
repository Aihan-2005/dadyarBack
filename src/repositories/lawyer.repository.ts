import type { ClientSession, Types, UpdateQuery } from "mongoose";

import {
  DEFAULT_LAWYER_STATUS,
  LAWYER_STATUSES,
  type LawyerStatus,
} from "../constants/lawyer.constants";

import type {
  AdminLawyerListAggregateResult,
  AdminLawyerListOptions,
  AdminLawyerStats,
  AdminLawyerStatusCount,
} from "../interfaces/admin.interface";

import type {
  CreateLawyerData,
  Lawyer,
  LawyerRecord,
} from "../interfaces/lawyer.interface";

import type {
  LawyerDirectoryAggregateRecord,
  LawyerDirectoryAggregateResult,
  LawyerDirectoryListOptions,
} from "../interfaces/lawyerDirectory.interface";

import LawyerModel from "../models/lawyer.model";

import { UserModel } from "../models/user.model";

import { BaseRepository } from "./base.repository";

export class LawyerRepository extends BaseRepository<Lawyer> {
  constructor() {
    super(LawyerModel);
  }

  public findByLicenseNumber(licenseNumber: string) {
    return this.model
      .findOne({
        licenseNumber,
      })
      .lean<LawyerRecord>()
      .exec();
  }

  public findById(id: string) {
    return this.model.findById(this.toObjectId(id)).lean<LawyerRecord>().exec();
  }

  public async create(
    userId: Types.ObjectId,

    data: CreateLawyerData,

    session?: ClientSession,
  ) {
    const createData = {
      _id: userId,

      firstName: data.firstName,

      lastName: data.lastName,

      status: DEFAULT_LAWYER_STATUS,

      licenseVerifiedAt: null,

      specialization: "",

      yearsOfExperience: 0,

      address: "",

      bio: "",

      education: [],

      experience: [],

      skills: [],

      languages: [],

      clientDirectory: {
        isVisible: false,

        isFeatured: false,

        displayOrder: null,

        publishedAt: null,
      },
    };

    if (!session) {
      return this.model.create(createData);
    }

    const [lawyer] = await this.model.create(
      [createData],

      {
        session,
      },
    );

    return lawyer;
  }

  public updateProfileById(
    id: string,

    update: UpdateQuery<Lawyer>,

    session?: ClientSession,
  ) {
    return this.model
      .findByIdAndUpdate(
        this.toObjectId(id),

        update,

        {
          new: true,

          runValidators: true,

          session,
        },
      )
      .lean<LawyerRecord>()
      .exec();
  }

  public findByIds(ids: string[]) {
    if (ids.length === 0) {
      return Promise.resolve([]);
    }

    return this.model
      .find({
        _id: {
          $in: ids.map((id) => this.toObjectId(id)),
        },
      })
      .select("firstName lastName specialization")
      .lean<LawyerRecord[]>()
      .exec();
  }

  public updateStatusById(
    id: string,

    status: LawyerStatus,

    licenseVerifiedAt?: Date | null,
  ) {
    const update: UpdateQuery<Lawyer> = {
      $set: {
        status,
      },
    };

    if (licenseVerifiedAt !== undefined) {
      update.$set = {
        ...update.$set,

        licenseVerifiedAt,
      };
    }

    return this.model
      .findByIdAndUpdate(
        this.toObjectId(id),

        update,

        {
          new: true,

          runValidators: true,
        },
      )
      .lean<LawyerRecord>()
      .exec();
  }

  public async findForAdmin(options: AdminLawyerListOptions) {
    const skip = (options.page - 1) * options.limit;

    const match: Record<string, unknown> = {
      "user.role": "LAWYER",
    };

    if (options.lawyerStatus) {
      match.status = options.lawyerStatus;
    }

    if (options.accountStatus) {
      match["user.status"] = options.accountStatus;
    }

    const search = options.search?.trim();

    if (search) {
      const pattern = this.escapeRegex(search);

      const regex = new RegExp(pattern, "i");

      match.$or = [
        {
          firstName: regex,
        },

        {
          lastName: regex,
        },

        {
          licenseNumber: regex,
        },

        {
          specialization: regex,
        },

        {
          "user.email": regex,
        },

        {
          "user.phone": regex,
        },

        {
          $expr: {
            $regexMatch: {
              input: {
                $concat: ["$firstName", " ", "$lastName"],
              },

              regex: pattern,

              options: "i",
            },
          },
        },
      ];
    }

    const [result] = await this.model
      .aggregate<AdminLawyerListAggregateResult>([
        {
          $lookup: {
            from: UserModel.collection.name,

            localField: "_id",

            foreignField: "_id",

            as: "user",
          },
        },

        {
          $unwind: "$user",
        },

        {
          $project: {
            "user.password": 0,

            "user.__v": 0,
          },
        },

        {
          $match: match,
        },

        {
          $sort: {
            createdAt: -1,
          },
        },

        {
          $facet: {
            items: [
              {
                $skip: skip,
              },

              {
                $limit: options.limit,
              },
            ],

            total: [
              {
                $count: "count",
              },
            ],
          },
        },
      ])
      .exec();

    return {
      items: result?.items ?? [],

      total: result?.total[0]?.count ?? 0,
    };
  }

  public findClientDirectoryStateById(
    id: string,

    session?: ClientSession,
  ) {
    const query = this.model
      .findById(this.toObjectId(id))
      .select("_id status clientDirectory");

    if (session) {
      query.session(session);
    }

    return query.lean<LawyerRecord>().exec();
  }

  public findClientDirectoryPlacements() {
    return this.model
      .find({
        "clientDirectory.isVisible": true,
      })
      .select("_id clientDirectory")
      .sort({
        "clientDirectory.displayOrder": 1,

        createdAt: 1,
      })
      .lean<LawyerRecord[]>()
      .exec();
  }

  public countClientDirectoryPlacements(session?: ClientSession) {
    const query = this.model.countDocuments({
      "clientDirectory.isVisible": true,
    });

    if (session) {
      query.session(session);
    }

    return query.exec();
  }

  public shiftClientDirectoryForInsert(
    targetOrder: number,

    session: ClientSession,
  ) {
    return this.model
      .updateMany(
        {
          "clientDirectory.isVisible": true,

          "clientDirectory.displayOrder": {
            $gte: targetOrder,
          },
        },

        {
          $inc: {
            "clientDirectory.displayOrder": 1,
          },
        },

        {
          session,
        },
      )
      .exec();
  }

  public shiftClientDirectoryForRemoval(
    removedOrder: number,

    session: ClientSession,
  ) {
    return this.model
      .updateMany(
        {
          "clientDirectory.isVisible": true,

          "clientDirectory.displayOrder": {
            $gt: removedOrder,
          },
        },

        {
          $inc: {
            "clientDirectory.displayOrder": -1,
          },
        },

        {
          session,
        },
      )
      .exec();
  }

  public shiftClientDirectoryForMove(
    lawyerId: string,

    currentOrder: number,

    targetOrder: number,

    session: ClientSession,
  ) {
    const lawyerObjectId = this.toObjectId(lawyerId);

    if (targetOrder < currentOrder) {
      return this.model
        .updateMany(
          {
            _id: {
              $ne: lawyerObjectId,
            },

            "clientDirectory.isVisible": true,

            "clientDirectory.displayOrder": {
              $gte: targetOrder,

              $lt: currentOrder,
            },
          },

          {
            $inc: {
              "clientDirectory.displayOrder": 1,
            },
          },

          {
            session,
          },
        )
        .exec();
    }

    if (targetOrder > currentOrder) {
      return this.model
        .updateMany(
          {
            _id: {
              $ne: lawyerObjectId,
            },

            "clientDirectory.isVisible": true,

            "clientDirectory.displayOrder": {
              $gt: currentOrder,

              $lte: targetOrder,
            },
          },

          {
            $inc: {
              "clientDirectory.displayOrder": -1,
            },
          },

          {
            session,
          },
        )
        .exec();
    }

    return Promise.resolve(null);
  }

  public updateClientDirectoryById(
    lawyerId: string,

    update: UpdateQuery<Lawyer>,

    session?: ClientSession,
  ) {
    return this.model
      .findByIdAndUpdate(
        this.toObjectId(lawyerId),

        update,

        {
          new: true,

          runValidators: true,

          session,
        },
      )
      .lean<LawyerRecord>()
      .exec();
  }

  public async findClientDirectory(options: LawyerDirectoryListOptions) {
    const skip = (options.page - 1) * options.limit;

    const match: Record<string, unknown> = {
      status: LAWYER_STATUSES.ACTIVE,

      "clientDirectory.isVisible": true,

      "user.role": "LAWYER",

      "user.status": "ACTIVE",
    };

    if (options.featuredOnly === true) {
      match["clientDirectory.isFeatured"] = true;
    }

    const specialization = options.specialization?.trim();

    if (specialization) {
      match.specialization = specialization;
    }

    const search = options.search?.trim();

    if (search) {
      const pattern = this.escapeRegex(search);

      const regex = new RegExp(pattern, "i");

      match.$or = [
        {
          firstName: regex,
        },

        {
          lastName: regex,
        },

        {
          specialization: regex,
        },

        {
          licenseNumber: regex,
        },

        {
          address: regex,
        },

        {
          bio: regex,
        },

        {
          "skills.name": regex,
        },

        {
          languages: regex,
        },

        {
          $expr: {
            $regexMatch: {
              input: {
                $concat: ["$firstName", " ", "$lastName"],
              },

              regex: pattern,

              options: "i",
            },
          },
        },
      ];
    }

    const [result] = await this.model
      .aggregate<LawyerDirectoryAggregateResult>([
        {
          $lookup: {
            from: UserModel.collection.name,

            localField: "_id",

            foreignField: "_id",

            as: "user",
          },
        },

        {
          $unwind: "$user",
        },

        {
          $project: {
            "user.password": 0,

            "user.__v": 0,
          },
        },

        {
          $match: match,
        },

        {
          $sort: {
            "clientDirectory.displayOrder": 1,

            createdAt: 1,
          },
        },

        {
          $facet: {
            items: [
              {
                $skip: skip,
              },

              {
                $limit: options.limit,
              },
            ],

            total: [
              {
                $count: "count",
              },
            ],
          },
        },
      ])
      .exec();

    return {
      items: result?.items ?? [],

      total: result?.total[0]?.count ?? 0,
    };
  }

  public async findClientDirectoryById(
    lawyerId: string,
  ): Promise<LawyerDirectoryAggregateRecord | null> {
    const [result] = await this.model
      .aggregate<LawyerDirectoryAggregateRecord>([
        {
          $match: {
            _id: this.toObjectId(lawyerId),

            status: LAWYER_STATUSES.ACTIVE,

            "clientDirectory.isVisible": true,
          },
        },

        {
          $lookup: {
            from: UserModel.collection.name,

            localField: "_id",

            foreignField: "_id",

            as: "user",
          },
        },

        {
          $unwind: "$user",
        },

        {
          $match: {
            "user.role": "LAWYER",

            "user.status": "ACTIVE",
          },
        },

        {
          $project: {
            "user.password": 0,

            "user.__v": 0,
          },
        },

        {
          $limit: 1,
        },
      ])
      .exec();

    return result ?? null;
  }

  public async getAdminDashboardStats(): Promise<AdminLawyerStats> {
    const counts = await this.model
      .aggregate<AdminLawyerStatusCount>([
        {
          $group: {
            _id: "$status",

            count: {
              $sum: 1,
            },
          },
        },
      ])
      .exec();

    const getCount = (status: LawyerStatus): number =>
      counts.find((item) => item._id === status)?.count ?? 0;

    const statusCount: Record<string, number> = {};

    let total = 0;

    Object.values(LAWYER_STATUSES).forEach((status) => {
      const count = getCount(status);

      total += count;

      statusCount[this.screamingSnakeToCamel(status)] = count;
    });

    return {
      total,
      ...statusCount,
    } as AdminLawyerStats;
  }

  public acquireSubscriptionWriteGuard(
    lawyerId: string,
    session: ClientSession,
  ) {
    return this.model
      .findByIdAndUpdate(
        this.toObjectId(lawyerId),

        {
          $inc: {
            subscriptionRevision: 1,
          },
        },

        {
          new: true,

          session,

          timestamps: false,
        },
      )
      .select("_id")
      .lean<Pick<LawyerRecord, "_id">>()
      .exec();
  }
}
