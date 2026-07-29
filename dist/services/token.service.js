"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const crypto_1 = require("crypto");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const lawyer_constants_1 = require("../constants/lawyer.constants");
const messages_1 = require("../constants/messages");
const httpException_1 = require("../exceptions/httpException");
const refreshToken_repository_1 = require("../repositories/refreshToken.repository");
class TokenService {
    constructor() {
        this.repo = new refreshToken_repository_1.RefreshTokenRepository();
    }
    static getTokenFromHeaders(req) {
        const authorization = req.headers.authorization;
        if (!authorization) {
            return null;
        }
        const [scheme, token,] = authorization
            .trim()
            .split(/\s+/);
        if (scheme !== "Bearer" ||
            !token) {
            return null;
        }
        return token;
    }
    invalidTokenException() {
        return new httpException_1.HttpExceptoin(401, messages_1.MESSAGES.unauthorized[env_1.env.LANGUAGE], "INVALID_ACCESS_TOKEN");
    }
    invalidRefreshTokenException() {
        return new httpException_1.HttpExceptoin(401, messages_1.MESSAGES.invalidRefToken[env_1.env.LANGUAGE], "INVALID_REFRESH_TOKEN");
    }
    generateAccessToken(userId) {
        return jsonwebtoken_1.default.sign({
            role: lawyer_constants_1.LAWYER_ROLES.LAWYER,
            type: "access",
        }, env_1.env.JWT_ACC_SECRET, {
            subject: userId,
            issuer: env_1.env.JWT_ISSUER,
            audience: env_1.env.JWT_AUDIENCE,
            expiresIn: env_1.env.ACCESS_TOKEN_TTL_SECONDS,
        });
    }
    async generateRefreshToken(userId) {
        const jti = (0, crypto_1.randomUUID)();
        const refreshTokenTTLSeconds = env_1.env.REFRESH_TOKEN_TTL_DAYS *
            24 *
            60 *
            60;
        const expiresAt = new Date(Date.now() +
            refreshTokenTTLSeconds *
                1000);
        const refreshToken = jsonwebtoken_1.default.sign({
            type: "refresh",
        }, env_1.env.JWT_REF_SECRET, {
            subject: userId,
            jwtid: jti,
            issuer: env_1.env.JWT_ISSUER,
            audience: env_1.env.JWT_AUDIENCE,
            expiresIn: refreshTokenTTLSeconds,
        });
        await this.repo.create(userId, jti, expiresAt);
        return refreshToken;
    }
    async issueTokenPair(userId) {
        const accessToken = this.generateAccessToken(userId);
        const refreshToken = await this.generateRefreshToken(userId);
        return {
            accessToken,
            refreshToken,
            accessTokenExpiresIn: env_1.env.ACCESS_TOKEN_TTL_SECONDS,
        };
    }
    verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACC_SECRET, {
                issuer: env_1.env.JWT_ISSUER,
                audience: env_1.env.JWT_AUDIENCE,
            });
            if (typeof decoded ===
                "string" ||
                typeof decoded.sub !==
                    "string" ||
                decoded.type !==
                    "access" ||
                decoded.role !==
                    lawyer_constants_1.LAWYER_ROLES.LAWYER) {
                throw this.invalidTokenException();
            }
            return decoded;
        }
        catch (error) {
            if (error instanceof
                httpException_1.HttpExceptoin) {
                throw error;
            }
            throw this.invalidTokenException();
        }
    }
    verifyRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_REF_SECRET, {
                issuer: env_1.env.JWT_ISSUER,
                audience: env_1.env.JWT_AUDIENCE,
            });
            if (typeof decoded ===
                "string" ||
                typeof decoded.sub !==
                    "string" ||
                typeof decoded.jti !==
                    "string" ||
                decoded.type !==
                    "refresh") {
                throw this
                    .invalidRefreshTokenException();
            }
            return decoded;
        }
        catch (error) {
            if (error instanceof
                httpException_1.HttpExceptoin) {
                throw error;
            }
            throw this
                .invalidRefreshTokenException();
        }
    }
    async consumeRefreshToken(refreshToken) {
        const payload = this.verifyRefreshToken(refreshToken);
        const stored = await this.repo.consumeByJti(payload.jti);
        if (!stored) {
            throw new httpException_1.HttpExceptoin(401, messages_1.MESSAGES.noRefToken[env_1.env.LANGUAGE], "REFRESH_TOKEN_REVOKED");
        }
        if (stored.userId.toString() !==
            payload.sub) {
            throw this
                .invalidRefreshTokenException();
        }
        return payload.sub;
    }
    async revokeRefreshToken(refreshToken) {
        try {
            const payload = this.verifyRefreshToken(refreshToken);
            await this.repo.deleteByJti(payload.jti);
        }
        catch (error) {
            if (error instanceof
                httpException_1.HttpExceptoin) {
                return;
            }
            throw error;
        }
    }
}
exports.TokenService = TokenService;
