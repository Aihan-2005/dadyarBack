import dotenv from "dotenv";
import { z } from "zod";

export type Enviroment = "development" | "production" | "test";
type Language = "en" | "fa";
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().min(1),
  JWT_ACC_SECRET: z.string().min(10),
  JWT_REF_SECRET: z.string().min(10),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  ORIGIN: z.url(),
  CREDENTIAL: z.coerce.boolean().default(true),
  LANGUAGE: z.enum(["en", "fa"]).default("en")
});



class Env {
  public readonly PORT: number;
  public readonly MONGO_URI: string;
  public readonly JWT_ACC_SECRET: string;
  public readonly JWT_REF_SECRET: string;
  public readonly NODE_ENV: Enviroment;
  public readonly ORIGIN: string;
  public readonly CREDENTIAL: boolean;
  public readonly LANGUAGE: Language;

  constructor(processEnv = process.env) {

    const parsed = envSchema.safeParse(processEnv);

    if (!parsed.success) {
      console.error("Invalid environment variables:");
      console.error(parsed.error.format());
      process.exit(1);
    }

    this.PORT = parsed.data.PORT;
    this.JWT_ACC_SECRET = parsed.data.JWT_ACC_SECRET;
    this.JWT_REF_SECRET = parsed.data.JWT_REF_SECRET;
    this.MONGO_URI = parsed.data.MONGO_URI;
    this.NODE_ENV = parsed.data.NODE_ENV;
    this.ORIGIN = parsed.data.ORIGIN;
    this.CREDENTIAL = parsed.data.CREDENTIAL;
    this.LANGUAGE = parsed.data.LANGUAGE;
  }
}

export const env = new Env()
