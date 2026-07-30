import type {
  RefreshToken,
  RefreshTokenRecord,
} from "../interfaces/token.interface";

import {
  RefreshTokenModel,
} from "../models/refreshToken.model";

import {
  BaseRepository,
} from "./base.repository";

export class RefreshTokenRepository extends BaseRepository<RefreshToken> {
  constructor() {
    super(RefreshTokenModel);
  }

  public create(
    userId: string,
    jti: string,
    expiresAt: Date,
  ) {
    return this.model.create({
      userId:
        this.toObjectId(userId),

      jti,

      expiresAt,
    });
  }

  public findByJti(
    jti: string,
  ) {
    return this.model
      .findOne({ jti })
      .lean<RefreshTokenRecord>()
      .exec();
  }

  
  public consumeByJti(
    jti: string,
  ) {
    return this.model
      .findOneAndDelete({
        jti,
      })
      .lean<RefreshTokenRecord>()
      .exec();
  }

  public deleteByJti(
    jti: string,
  ) {
    return this.model
      .deleteOne({ jti })
      .exec();
  }

  public deleteAllByUserId(
    userId: string,
  ) {
    return this.model
      .deleteMany({
        userId:
          this.toObjectId(
            userId,
          ),
      })
      .exec();
  }
}