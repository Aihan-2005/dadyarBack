import { ClientSession } from "mongoose";
import type {
  RefreshToken,
  RefreshTokenRecord,
} from "../interfaces/token.interface";

import { RefreshTokenModel } from "../models/refreshToken.model";

import { BaseRepository } from "./base.repository";

export class RefreshTokenRepository extends BaseRepository<RefreshToken> {
  constructor() {
    super(RefreshTokenModel);
  }

  public async create(
    userId: string,
    jti: string,
    expiresAt: Date,
    session?: ClientSession,
  ) {
    if (!session) {
      return this.model.create({
        userId: this.toObjectId(userId),

        jti,

        expiresAt,
      });
    }

    const [createdRefreshToken] = await this.model.create(
      [
        {
          userId: this.toObjectId(userId),

          jti,

          expiresAt,
        },
      ],
      {
        session,
      },
    );
    return createdRefreshToken;
  }

  public findByJti(jti: string) {
    return this.model.findOne({ jti }).lean<RefreshTokenRecord>().exec();
  }

  public consumeByJti(jti: string) {
    return this.model
      .findOneAndDelete({
        jti,
      })
      .lean<RefreshTokenRecord>()
      .exec();
  }

  public deleteByJti(jti: string) {
    return this.model.deleteOne({ jti }).exec();
  }

  public deleteAllByUserId(userId: string, session?: ClientSession) {
    return this.model
      .deleteMany(
        {
          userId: this.toObjectId(userId),
        },
        {
          session,
        },
      )
      .exec();
  }
}

