import { randomUUID } from "crypto";

import type { Request } from "express";

import jwt, { type JwtPayload } from "jsonwebtoken";

import { env } from "../config/env";

import { LAWYER_ROLES } from "../constants/lawyer.constants";

import { MESSAGES } from "../constants/messages.constants";

import { HttpException } from "../exceptions/httpException";

import type {
  AccessTokenPayload,
  RefreshTokenPayload,
  TokenPair,
} from "../interfaces/token.interface";

import { RefreshTokenRepository } from "../repositories/refreshToken.repository";
import { ClientSession } from "mongoose";

export class TokenService {
  private readonly repo = new RefreshTokenRepository();

  public static getTokenFromHeaders(req: Request): string | null {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return null;
    }

    const [scheme, token] = authorization.trim().split(/\s+/);

    if (scheme !== "Bearer" || !token) {
      return null;
    }

    return token;
  }

  private invalidTokenException() {
    return new HttpException(
      401,
      MESSAGES.unauthorized[env.LANGUAGE],
      "INVALID_ACCESS_TOKEN",
    );
  }

  private invalidRefreshTokenException() {
    return new HttpException(
      401,
      MESSAGES.invalidRefToken[env.LANGUAGE],
      "INVALID_REFRESH_TOKEN",
    );
  }

  public generateAccessToken(userId: string): string {
    return jwt.sign(
      {
        role: LAWYER_ROLES.LAWYER,

        type: "access",
      },
      env.JWT_ACC_SECRET,
      {
        subject: userId,

        issuer: env.JWT_ISSUER,

        audience: env.JWT_AUDIENCE,

        expiresIn: env.ACCESS_TOKEN_TTL_SECONDS,
      },
    );
  }

  public async generateRefreshToken(
    userId: string,
    session?: ClientSession,
  ): Promise<string> {
    const jti = randomUUID();

    const refreshTokenTTLSeconds = env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60;

    const expiresAt = new Date(Date.now() + refreshTokenTTLSeconds * 1000);

    const refreshToken = jwt.sign(
      {
        type: "refresh",
      },
      env.JWT_REF_SECRET,
      {
        subject: userId,

        jwtid: jti,

        issuer: env.JWT_ISSUER,

        audience: env.JWT_AUDIENCE,

        expiresIn: refreshTokenTTLSeconds,
      },
    );

    await this.repo.create(userId, jti, expiresAt, session);

    return refreshToken;
  }

  public async issueTokenPair(
    userId: string,
    session?: ClientSession,
  ): Promise<TokenPair> {
    const accessToken = this.generateAccessToken(userId);

    const refreshToken = await this.generateRefreshToken(userId, session);

    return {
      accessToken,

      refreshToken,

      accessTokenExpiresIn: env.ACCESS_TOKEN_TTL_SECONDS,
    };
  }

  public verifyAccessToken(token: string): AccessTokenPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_ACC_SECRET, {
        issuer: env.JWT_ISSUER,

        audience: env.JWT_AUDIENCE,
      });

      if (
        typeof decoded === "string" ||
        typeof decoded.sub !== "string" ||
        decoded.type !== "access" ||
        decoded.role !== LAWYER_ROLES.LAWYER
      ) {
        throw this.invalidTokenException();
      }

      return decoded as AccessTokenPayload;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw this.invalidTokenException();
    }
  }

  public verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_REF_SECRET, {
        issuer: env.JWT_ISSUER,

        audience: env.JWT_AUDIENCE,
      });

      if (
        typeof decoded === "string" ||
        typeof decoded.sub !== "string" ||
        typeof decoded.jti !== "string" ||
        decoded.type !== "refresh"
      ) {
        throw this.invalidRefreshTokenException();
      }

      return decoded as RefreshTokenPayload;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw this.invalidRefreshTokenException();
    }
  }

  public async consumeRefreshToken(refreshToken: string): Promise<string> {
    const payload = this.verifyRefreshToken(refreshToken);

    const stored = await this.repo.consumeByJti(payload.jti);

    if (!stored) {
      throw new HttpException(
        401,
        MESSAGES.noRefToken[env.LANGUAGE],
        "REFRESH_TOKEN_REVOKED",
      );
    }

    if (stored.userId.toString() !== payload.sub) {
      throw this.invalidRefreshTokenException();
    }

    return payload.sub;
  }

  public async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      const payload = this.verifyRefreshToken(refreshToken);

      await this.repo.deleteByJti(payload.jti);
    } catch (error) {
      if (error instanceof HttpException) {
        return;
      }

      throw error;
    }
  }
  public async revokeAllUserSessions(
    userId: string,
    session?: ClientSession,
  ): Promise<void> {
    await this.repo.deleteAllByUserId(userId, session);
  }
}
