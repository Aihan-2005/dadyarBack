"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenModel = exports.RefreshTokenSchema = void 0;
const mongoose_1 = require("mongoose");
exports.RefreshTokenSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Lawyer",
        required: true,
        index: true,
    },
    jti: {
        type: String,
        required: true,
        unique: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
exports.RefreshTokenSchema.index({
    expiresAt: 1,
}, {
    expireAfterSeconds: 0,
});
exports.RefreshTokenModel = (0, mongoose_1.model)("RefreshToken", exports.RefreshTokenSchema);
