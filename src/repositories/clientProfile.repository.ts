import type { ClientSession } from "mongoose";

import type {
  ClientProfile,
  ClientProfileRecord,
} from "../interfaces/clientProfile.interface";

import { ClientProfileModel } from "../models/clientProfile.model";
import { BaseRepository } from "./base.repository";

export class ClientProfileRepository extends BaseRepository<ClientProfile> {
  constructor() {
    super(ClientProfileModel);
  }

  public findByUserId(userId: string, session?: ClientSession) {
    const query = this.model.findOne({
      userId: this.toObjectId(userId),
    });

    if (session) {
      query.session(session);
    }

    return query.lean<ClientProfileRecord>().exec();
  }

  public findByUserIds(userIds: string[], session?: ClientSession) {
    if (userIds.length === 0) {
      return Promise.resolve([] as ClientProfileRecord[]);
    }

    const query = this.model.find({
      userId: {
        $in: userIds.map((userId) => this.toObjectId(userId)),
      },
    });

    if (session) {
      query.session(session);
    }

    return query.lean<ClientProfileRecord[]>().exec();
  }

  public upsertByUserId(
    userId: string,
    fullName: string,
    session?: ClientSession,
  ) {
    return this.model
      .findOneAndUpdate(
        {
          userId: this.toObjectId(userId),
        },
        {
          $set: {
            fullName,
          },
          $setOnInsert: {
            userId: this.toObjectId(userId),
          },
        },
        {
          returnDocument: "after",
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
          session,
        },
      )
      .lean<ClientProfileRecord>()
      .exec();
  }
}
