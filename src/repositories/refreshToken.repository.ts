import { RefreshTokenModel } from "../models/refreshToken.model";
import { BaseRepository } from "./base.repository";
import { RefreshToken } from "../interfaces/token.interface";

export class RefreshTokenRepository extends BaseRepository<RefreshToken> {

  constructor() {
    super(RefreshTokenModel)
  }

  create(userId: string, jti: string, expiresAt: Date) {
    return this.model.create({
      userId: this.toObjectId(userId),
      jti,
      expiresAt,
    });
  }

  findByJti(jti: string) {
    return this.model.findOne({ jti }).lean().exec();
  }

  deleteById(id: string) {
    return this.model.deleteOne({ _id: this.toObjectId(id) }).exec();
  }

  deleteByJti(jti: string) {
    return this.model.deleteOne({ jti }).exec();
  }

}
