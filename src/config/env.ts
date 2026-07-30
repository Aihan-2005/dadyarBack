import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

export type Enviroment =
  | "development"
  | "production"
  | "test";

export type Language =
  | "en"
  | "fa";

const BooleanFromEnvironment = z.preprocess(
  (value) => {
    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value !== "string") {
      return value;
    }

    const normalized =
      value.trim().toLowerCase();

    if (
      normalized === "true" ||
      normalized === "1"
    ) {
      return true;
    }

    if (
      normalized === "false" ||
      normalized === "0"
    ) {
      return false;
    }

    return value;
  },
  z.boolean(),
);

const OriginsSchema = z
  .string()
  .min(1)
  .transform((value) =>
    value
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  )
  .refine(
    (origins) =>
      origins.length > 0 &&
      origins.every((origin) => {
        try {
          new URL(origin);
          return true;
        } catch {
          return false;
        }
      }),
    {
      message:
        "ORIGIN must contain valid comma-separated URLs",
    },
  );

const envSchema = z.object({
  PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(5000),

  MONGO_URI: z
    .string()
    .min(1),

 
  JWT_ACC_SECRET: z
    .string()
    .min(32),

  JWT_REF_SECRET: z
    .string()
    .min(32),

  JWT_ISSUER: z
    .string()
    .min(1)
    .default("dadyar-api"),

  JWT_AUDIENCE: z
    .string()
    .min(1)
    .default("dadyar-web"),

  ACCESS_TOKEN_TTL_SECONDS:
    z.coerce
      .number()
      .int()
      .positive()
      .default(15 * 60),

  REFRESH_TOKEN_TTL_DAYS:
    z.coerce
      .number()
      .int()
      .positive()
      .default(30),

  NODE_ENV: z
    .enum([
      "development",
      "production",
      "test",
    ])
    .default("development"),

 
  ORIGIN: OriginsSchema,

  CREDENTIAL:
    BooleanFromEnvironment.default(
      true,
    ),

  TRUST_PROXY:
    BooleanFromEnvironment.default(
      false,
    ),

  COOKIE_SECURE:
    BooleanFromEnvironment.optional(),

  LANGUAGE: z
    .enum(["en", "fa"])
    .default("fa"),
});

class Env {
  public readonly PORT: number;

  public readonly MONGO_URI: string;

  public readonly JWT_ACC_SECRET:
    string;

  public readonly JWT_REF_SECRET:
    string;

  public readonly JWT_ISSUER:
    string;

  public readonly JWT_AUDIENCE:
    string;

  public readonly ACCESS_TOKEN_TTL_SECONDS:
    number;

  public readonly REFRESH_TOKEN_TTL_DAYS:
    number;

  public readonly NODE_ENV:
    Enviroment;

  public readonly ORIGINS:
    string[];

  public readonly CREDENTIAL:
    boolean;

  public readonly TRUST_PROXY:
    boolean;

  public readonly COOKIE_SECURE:
    boolean;

  public readonly LANGUAGE:
    Language;

  constructor(
    processEnv = process.env,
  ) {
    const parsed =
      envSchema.safeParse(
        processEnv,
      );

    if (!parsed.success) {
      console.error(
        "Invalid environment variables:",
      );

      console.error(
        parsed.error.format(),
      );

      process.exit(1);
    }

    const data = parsed.data;

    this.PORT =
      data.PORT;

    this.MONGO_URI =
      data.MONGO_URI;

    this.JWT_ACC_SECRET =
      data.JWT_ACC_SECRET;

    this.JWT_REF_SECRET =
      data.JWT_REF_SECRET;

    this.JWT_ISSUER =
      data.JWT_ISSUER;

    this.JWT_AUDIENCE =
      data.JWT_AUDIENCE;

    this.ACCESS_TOKEN_TTL_SECONDS =
      data.ACCESS_TOKEN_TTL_SECONDS;

    this.REFRESH_TOKEN_TTL_DAYS =
      data.REFRESH_TOKEN_TTL_DAYS;

    this.NODE_ENV =
      data.NODE_ENV;

    this.ORIGINS =
      data.ORIGIN;

    this.CREDENTIAL =
      data.CREDENTIAL;

    this.TRUST_PROXY =
      data.TRUST_PROXY;

    this.COOKIE_SECURE =
      data.COOKIE_SECURE ??
      data.NODE_ENV === "production";

    this.LANGUAGE =
      data.LANGUAGE;
  }
}

export const env = new Env();