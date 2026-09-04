import type { ClientSession } from "mongoose";

import type {
  CreateUserData,
  User,
  UserAccessContext,
  UserAuthRecord,
  UserRecord,
  UserRole,
  UserStatus,
} from "../interfaces/user.interface";

import type { AdminUserListOptions } from "../interfaces/admin.interface";

import { DEFAULT_USER_STATUS } from "../constants/user.constants";
import { UserModel } from "../models/user.model";

import { BaseRepository } from "./base.repository";

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(UserModel);
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

  public findByRole(role: UserRole, options: AdminUserListOptions) {
    const skip = (options.page - 1) * options.limit;

    return this.model
      .find({ role })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .lean<UserRecord[]>()
      .exec();
  }

  public countByRole(role: UserRole) {
    return this.model.countDocuments({ role }).exec();
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
}
