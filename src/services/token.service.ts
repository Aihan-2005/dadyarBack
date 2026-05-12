import type { Request } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { randomUUID } from "crypto";
import dayjs from "dayjs";
import { RefreshTokenRepository } from "../repositories/refreshToken.repository";
import { env } from "../config/env";
import { Payload, RefreshTokenPayload } from "../interfaces/token.interface";
import { MESSAGES } from "../constants/messages";
import { HttpExceptoin } from "../exceptions/httpException";

export class TokenService {
  private readonly repo = new RefreshTokenRepository();

  public static getTokenFromHeaders(req: Request): string | null {
    const header = req.headers.authorization;
    if (!header) return null;

    const [type, token] = header.split(" ");
    if (type !== "Bearer" || !token) return null;

    return token;
  }

  private signToken(
    payload: object,
    secret: string,
    expiresInSec: number,
    jti?: string,
  ) {
    const options = jti
      ? { jwtid: jti, expiresIn: expiresInSec }
      : { expiresIn: expiresInSec };
    return jwt.sign(payload, secret, options);
  }

  public generateAccessToken(userId: string): string {
    // 15 minutes
    return this.signToken(
      { userId } satisfies Payload,
      env.JWT_ACC_SECRET,
      15 * 60,
    );
  }

  public verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_ACC_SECRET) as JwtPayload;
  }

  public async generateRefreshToken(userId: string): Promise<string> {
    const jti = randomUUID();
    const expiresAt = dayjs().add(30, "day").toDate();

    // 30 days in seconds
    const raw = this.signToken(
      { userId } satisfies Payload,
      env.JWT_REF_SECRET,
      30 * 24 * 60 * 60,
      jti,
    );

    await this.repo.create(userId, jti, expiresAt);
    return raw;
  }

  public verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, env.JWT_REF_SECRET) as RefreshTokenPayload;
  }

  /**
   * Rotation flow:
   * - verify JWT signature + exp
   * - check jti exists in DB
   * - delete old jti (revoke)
   * - issue new access + refresh
   */
  public async rotateRefreshToken(refreshToken: string) {
    const payload = this.verifyRefreshToken(refreshToken);

    const jti = payload.jti;
    const userId = payload.userId;

    if (!jti || !userId)
      throw new HttpExceptoin(401, MESSAGES.invlaidRefToken[env.LANGUAGE]);

    const stored = await this.repo.findByJti(jti);
    if (!stored)
      throw new HttpExceptoin(401, MESSAGES.noRefToken[env.LANGUAGE]);

    // revoke old token (prevents replay)
    await this.repo.deleteByJti(jti);

    const accessToken = this.generateAccessToken(userId);
    const newRefreshToken = await this.generateRefreshToken(userId);

    return { accessToken, refreshToken: newRefreshToken };
  }

  public revokeRefreshToken(refreshToken: string) {
    const payload = this.verifyRefreshToken(refreshToken);
    if (!payload.jti) return null;
    return this.repo.deleteByJti(payload.jti);
  }
}
