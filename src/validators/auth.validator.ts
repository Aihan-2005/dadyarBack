import { z } from "zod";
import { MESSAGES } from "../constants/messages";
import { env } from "../config/env";

const LANGUAGE = env.LANGUAGE;

export const SignupSchema = z
  .object({
    name: z.string().min(1).transform(v => v.trim()),
    lastname: z.string().min(1).transform(v => v.trim()),
    email: z.email().transform(v => v.trim().toLowerCase()).optional(),
    phone: z.string().regex(/^09\d{9}$/).transform(v => v.trim()).optional(),
    password: z.string().min(8),
    barLicenseNumber: z.string().min(1).transform(v => v.trim()),
    address: z.object({
      province: z.string().min(1).transform(v => v.trim()),
      city: z.string().min(1).transform(v => v.trim()),
      fullAddress: z.string().min(1).transform(v => v.trim()),
    }),
    yearsOfExperience: z.number().int().min(0),
    website: z.url().transform(v => v.trim()).optional(),
    bio: z.string().transform(v => v.trim()).optional(),
  })
  .refine(d => !!d.email || !!d.phone, { message: MESSAGES.noEmailNorPhone[LANGUAGE] });

export const LoginSchema = z.object({
  identifier: z.string().min(1).transform(v => v.trim()),
  password: z.string().min(1),
});

