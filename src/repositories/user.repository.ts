import type { ClientSession, QueryFilter } from "mongoose";

import type {
  CreateUserData,
  User,
  UserAccessContext,
  UserAuthRecord,
  UserRecord,
  UserRole,
  UserStatus,
} from "../interfaces/user.interface";

import type {
  AdminAccountStats,
  AdminClientListOptions,
  AdminUserStatusCount,
} from "../interfaces/admin.interface";

import { DEFAULT_USER_STATUS } from "../constants/user.constants";
import { UserModel } from "../models/user.model";

import { BaseRepository } from "./base.repository";

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(UserModel);
  }

  private buildAdminClientFilter(
    options: AdminClientListOptions,
  ): QueryFilter<User> {
    const filter: QueryFilter<User> = {
      role: "CLIENT",
    };

    if (options.accountStatus) {
      filter.status = options.accountStatus;
    }

    const search = options.search?.trim();

    if (search) {
      const pattern = this.escapeRegex(search);

      const regex = new RegExp(pattern, "i");

      filter.$or = [
        {
          email: regex,
        },

        {
          phone: regex,
        },
      ];
    }

    return filter;
  }

  public findById(id: string) {
    return this.model.findById(this.toObjectId(id)).lean<UserRecord>().exec();
  }

  public findByEmail(email: string) {
    return this.model
      .findOne({
        email,
      })
      .lean<UserRecord>()
      .exec();
  }

  public findByPhone(phone: string, session?: ClientSession) {
    const query = this.model.findOne({
      phone,
    });

    if (session) {
      query.session(session);
    }

    return query.lean<UserRecord>().exec();
  }

  public findAuthByEmail(email: string) {
    return this.model
      .findOne({
        email,
      })
      .select("+password")
      .lean<UserAuthRecord>()
      .exec();
  }

  public findAuthByPhone(phone: string) {
    return this.model
      .findOne({
        phone,
      })
      .select("+password")
      .lean<UserAuthRecord>()
      .exec();
  }

  public findAccessContextById(id: string) {
    return this.model
      .findById(this.toObjectId(id))
      .select("_id role status")
      .lean<UserAccessContext>()
      .exec();
  }

  public async create(data: CreateUserData, session?: ClientSession) {
    const createData = {
      ...data,

      status: DEFAULT_USER_STATUS,

      emailVerifiedAt: data.emailVerifiedAt ?? null,

      phoneVerifiedAt: data.phoneVerifiedAt ?? null,

      lastLoginAt: null,
    };

    if (!session) {
      return this.model.create(createData);
    }

    const [user] = await this.model.create([createData], {
      session,
    });

    return user;
  }

  public updateLastLogin(id: string, lastLoginAt: Date) {
    return this.model
      .updateOne(
        {
          _id: this.toObjectId(id),
        },

        {
          $set: {
            lastLoginAt,
          },
        },
      )
      .exec();
  }

  public updatePasswordById(
    id: string,
    password: string,
    session?: ClientSession,
  ) {
    return this.model
      .updateOne(
        {
          _id: this.toObjectId(id),
        },

        {
          $set: {
            password,
          },
        },

        {
          session,
        },
      )
      .exec();
  }

  public updatePhoneById(
    id: string,
    phone: string | undefined,
    session?: ClientSession,
  ) {
    const update = phone
      ? {
          $set: {
            phone,

            phoneVerifiedAt: null,
          },
        }
      : {
          $unset: {
            phone: 1 as const,
          },

          $set: {
            phoneVerifiedAt: null,
          },
        };

    return this.model
      .findByIdAndUpdate(this.toObjectId(id), update, {
        new: true,
        runValidators: true,
        session,
      })
      .lean<UserRecord>()
      .exec();
  }

  public findByIdAndRole(id: string, role: UserRole) {
    return this.model
      .findOne({
        _id: this.toObjectId(id),
        role,
      })
      .lean<UserRecord>()
      .exec();
  }

  public updateStatusByIdAndRole(
    id: string,
    role: UserRole,
    status: UserStatus,
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(id),
          role,
        },
        {
          $set: {
            status,
          },
        },
        {
          new: true,
          runValidators: true,
        },
      )
      .lean<UserRecord>()
      .exec();
  }

  public findClientsForAdmin(options: AdminClientListOptions) {
    const skip = (options.page - 1) * options.limit;

    const filter = this.buildAdminClientFilter(options);

    return this.model
      .find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(options.limit)
      .lean<UserRecord[]>()
      .exec();
  }

  public countClientsForAdmin(options: AdminClientListOptions) {
    const filter = this.buildAdminClientFilter(options);

    return this.model.countDocuments(filter).exec();
  }

  public async getAdminDashboardStats(): Promise<AdminAccountStats> {
    const counts = await this.model
      .aggregate<AdminUserStatusCount>([
        {
          $match: {
            role: {
              $in: ["CLIENT", "LAWYER"],
            },
          },
        },

        {
          $group: {
            _id: {
              role: "$role",
              status: "$status",
            },

            count: {
              $sum: 1,
            },
          },
        },
      ])
      .exec();

    const getCount = (role: UserRole, status: UserStatus): number =>
      counts.find(
        (item) => item._id.role === role && item._id.status === status,
      )?.count ?? 0;

    const activeClients = getCount("CLIENT", "ACTIVE");

    const suspendedClients = getCount("CLIENT", "SUSPENDED");

    const activeLawyers = getCount("LAWYER", "ACTIVE");

    const suspendedLawyers = getCount("LAWYER", "SUSPENDED");

    return {
      clients: {
        total: activeClients + suspendedClients,

        active: activeClients,

        suspended: suspendedClients,
      },

      lawyers: {
        total: activeLawyers + suspendedLawyers,

        active: activeLawyers,

        suspended: suspendedLawyers,
      },
    };
  }
}
