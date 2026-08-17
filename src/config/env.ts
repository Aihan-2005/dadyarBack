import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

export type Enviroment = "development" | "production" | "test";

export type Language = "en" | "fa";

const BooleanFromEnvironment = z.preprocess((value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "true" || normalized === "1") {
    return true;
  }

  if (normalized === "false" || normalized === "0") {
    return false;
  }

  return value;
}, z.boolean());

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
      message: "ORIGIN must contain valid comma-separated URLs",
    },
  );

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),

  MONGO_URI: z.string().min(1),

  JWT_ACC_SECRET: z.string().min(32),

  JWT_REF_SECRET: z.string().min(32),

  JWT_ISSUER: z.string().min(1).default("dadyar-api"),

  JWT_AUDIENCE: z.string().min(1).default("dadyar-web"),

  ACCESS_TOKEN_TTL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60),

  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  ORIGIN: OriginsSchema,

  CREDENTIAL: BooleanFromEnvironment.default(true),

  TRUST_PROXY: BooleanFromEnvironment.default(false),

  COOKIE_SECURE: BooleanFromEnvironment.optional(),

  ENABLE_API_DOCS: BooleanFromEnvironment.default(false),

  LANGUAGE: z.enum(["en", "fa"]).default("fa"),

  SMSIR_API_KEY: z.string().trim().min(1).optional(),

  OTP_TTL_SECONDS: z.coerce.number().int().positive().default(120),

  OTP_MAX_ATTEMPTS: z.coerce.number().int().positive().max(20).default(5),

  OTP_HMAC_SECRET: z.string().min(32),

  SMSIR_OTP_TEMPLATE_ID: z.coerce.number().int().positive().optional(),

  OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().int().positive().default(60),
});

class Env {
  public readonly PORT: number;

  public readonly MONGO_URI: string;

  public readonly JWT_ACC_SECRET: string;

  public readonly JWT_REF_SECRET: string;

  public readonly JWT_ISSUER: string;

  public readonly JWT_AUDIENCE: string;

  public readonly ACCESS_TOKEN_TTL_SECONDS: number;

  public readonly REFRESH_TOKEN_TTL_DAYS: number;

  public readonly NODE_ENV: Enviroment;

  public readonly ORIGINS: string[];

  public readonly CREDENTIAL: boolean;

  public readonly TRUST_PROXY: boolean;

  public readonly COOKIE_SECURE: boolean;

  public readonly ENABLE_API_DOCS: boolean;

  public readonly LANGUAGE: Language;

  public readonly SMSIR_API_KEY: string | undefined;

  public readonly OTP_TTL_SECONDS: number;

  public readonly OTP_MAX_ATTEMPTS: number;

  public readonly OTP_HMAC_SECRET: string;

  public readonly SMSIR_OTP_TEMPLATE_ID: number | undefined;

  public readonly OTP_RESEND_COOLDOWN_SECONDS: number;

  constructor(processEnv = process.env) {
    const parsed = envSchema.safeParse(processEnv);

    if (!parsed.success) {
      console.error("Invalid environment variables:");

      console.error(parsed.error.format());

      process.exit(1);
    }

    const data = parsed.data;

    this.PORT = data.PORT;

    this.MONGO_URI = data.MONGO_URI;

    this.JWT_ACC_SECRET = data.JWT_ACC_SECRET;

    this.JWT_REF_SECRET = data.JWT_REF_SECRET;

    this.JWT_ISSUER = data.JWT_ISSUER;

    this.JWT_AUDIENCE = data.JWT_AUDIENCE;

    this.ACCESS_TOKEN_TTL_SECONDS = data.ACCESS_TOKEN_TTL_SECONDS;

    this.REFRESH_TOKEN_TTL_DAYS = data.REFRESH_TOKEN_TTL_DAYS;

    this.NODE_ENV = data.NODE_ENV;

    this.ORIGINS = data.ORIGIN;

    this.CREDENTIAL = data.CREDENTIAL;

    this.TRUST_PROXY = data.TRUST_PROXY;

    this.COOKIE_SECURE = data.COOKIE_SECURE ?? data.NODE_ENV === "production";

    this.ENABLE_API_DOCS = data.ENABLE_API_DOCS;

    this.LANGUAGE = data.LANGUAGE;

    this.SMSIR_API_KEY = data.SMSIR_API_KEY;

    this.OTP_TTL_SECONDS = data.OTP_TTL_SECONDS;

    this.OTP_MAX_ATTEMPTS = data.OTP_MAX_ATTEMPTS;

    this.OTP_HMAC_SECRET = data.OTP_HMAC_SECRET;

    this.SMSIR_OTP_TEMPLATE_ID = data.SMSIR_OTP_TEMPLATE_ID;

    this.OTP_RESEND_COOLDOWN_SECONDS = data.OTP_RESEND_COOLDOWN_SECONDS;
  }
}

export const env = new Env();
