"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenRepository = void 0;
const refreshToken_model_1 = require("../models/refreshToken.model");
const base_repository_1 = require("./base.repository");
class RefreshTokenRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(refreshToken_model_1.RefreshTokenModel);
    }
    create(userId, jti, expiresAt) {
        return this.model.create({
            userId: this.toObjectId(userId),
            jti,
            expiresAt,
        });
    }
    findByJti(jti) {
        return this.model
            .findOne({ jti })
            .lean()
            .exec();
    }
    consumeByJti(jti) {
        return this.model
            .findOneAndDelete({
            jti,
        })
            .lean()
            .exec();
    }
    deleteByJti(jti) {
        return this.model
            .deleteOne({ jti })
            .exec();
    }
    deleteAllByUserId(userId) {
        return this.model
            .deleteMany({
            userId: this.toObjectId(userId),
        })
            .exec();
    }
}
exports.RefreshTokenRepository = RefreshTokenRepository;
