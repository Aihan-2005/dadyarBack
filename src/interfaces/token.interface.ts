import { InferSchemaType } from "mongoose";
import { RefreshTokenSchema } from "../models/refreshToken.model";
import { JwtPayload } from "jsonwebtoken";

export type RefreshToken = InferSchemaType<typeof RefreshTokenSchema>

// export type AccessTokenPayload = { userId: string };
export type RefreshTokenPayload = { userId: string } & JwtPayload;
export type Payload = { userId: string };
