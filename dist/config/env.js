"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const BooleanFromEnvironment = zod_1.z.preprocess((value) => {
    if (typeof value === "boolean") {
        return value;
    }
    if (typeof value !== "string") {
        return value;
    }
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" ||
        normalized === "1") {
        return true;
    }
    if (normalized === "false" ||
        normalized === "0") {
        return false;
    }
    return value;
}, zod_1.z.boolean());
const OriginsSchema = zod_1.z
    .string()
    .min(1)
    .transform((value) => value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean))
    .refine((origins) => origins.length > 0 &&
    origins.every((origin) => {
        try {
            new URL(origin);
            return true;
        }
        catch {
            return false;
        }
    }), {
    message: "ORIGIN must contain valid comma-separated URLs",
});
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce
        .number()
        .int()
        .positive()
        .default(5000),
    MONGO_URI: zod_1.z
        .string()
        .min(1),
    JWT_ACC_SECRET: zod_1.z
        .string()
        .min(32),
    JWT_REF_SECRET: zod_1.z
        .string()
        .min(32),
    JWT_ISSUER: zod_1.z
        .string()
        .min(1)
        .default("dadyar-api"),
    JWT_AUDIENCE: zod_1.z
        .string()
        .min(1)
        .default("dadyar-web"),
    ACCESS_TOKEN_TTL_SECONDS: zod_1.z.coerce
        .number()
        .int()
        .positive()
        .default(15 * 60),
    REFRESH_TOKEN_TTL_DAYS: zod_1.z.coerce
        .number()
        .int()
        .positive()
        .default(30),
    NODE_ENV: zod_1.z
        .enum([
        "development",
        "production",
        "test",
    ])
        .default("development"),
    ORIGIN: OriginsSchema,
    CREDENTIAL: BooleanFromEnvironment.default(true),
    TRUST_PROXY: BooleanFromEnvironment.default(false),
    COOKIE_SECURE: BooleanFromEnvironment.optional(),
    LANGUAGE: zod_1.z
        .enum(["en", "fa"])
        .default("fa"),
});
class Env {
    constructor(processEnv = process.env) {
        const parsed = envSchema.safeParse(processEnv);
        if (!parsed.success) {
            console.error("Invalid environment variables:");
            console.error(parsed.error.format());
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
exports.env = new Env();
