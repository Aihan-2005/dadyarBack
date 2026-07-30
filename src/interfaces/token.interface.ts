import type {
  JwtPayload,
} from "jsonwebtoken";

import type {
  Types,
} from "mongoose";

import type {
  LawyerRole,
} from "../constants/lawyer.constants";

export type TokenType =
  | "access"
  | "refresh";

export interface AccessTokenPayload
  extends JwtPayload {
  sub: string;

  role: LawyerRole;

  type: "access";
}

export interface RefreshTokenPayload
  extends JwtPayload {
  sub: string;

  jti: string;

  type: "refresh";
}

export interface RefreshToken {
  userId: Types.ObjectId;

  jti: string;

  expiresAt: Date;

  createdAt?: Date;

  updatedAt?: Date;
}

export interface RefreshTokenRecord
  extends RefreshToken {
  _id: Types.ObjectId;

  createdAt: Date;

  updatedAt: Date;
}

export interface TokenPair {
  accessToken: string;

  refreshToken: string;

  accessTokenExpiresIn:
    number;
}