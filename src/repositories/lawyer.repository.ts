import type { ClientSession, Types, UpdateQuery } from "mongoose";
import {
  DEFAULT_LAWYER_STATUS,
  type LawyerStatus,
} from "../constants/lawyer.constants";

import type {
  CreateLawyerData,
  Lawyer,
  LawyerRecord,
} from "../interfaces/lawyer.interface";

import LawyerModel from "../models/lawyer.model";
import { BaseRepository } from "./base.repository";

import type {
  AdminLawyerListAggregateResult,
  AdminLawyerListOptions,
} from "../interfaces/admin.interface";

import { UserModel } from "../models/user.model";

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
    };

    if (!session) {
      return this.model.create(createData);
    }

    const [lawyer] = await this.model.create([createData], {
      session,
    });

    return lawyer;
  }

  public updateProfileById(
    id: string,
    update: UpdateQuery<Lawyer>,
    session?: ClientSession,
  ) {
    return this.model
      .findByIdAndUpdate(this.toObjectId(id), update, {
        new: true,
        runValidators: true,
        session,
      })
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
      .findByIdAndUpdate(this.toObjectId(id), update, {
        new: true,
        runValidators: true,
      })
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

    const total = result?.total[0]?.count ?? 0;

    return {
      items: result?.items ?? [],

      total,
    };
  }
}
