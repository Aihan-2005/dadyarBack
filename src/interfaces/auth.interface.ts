import type { z } from "zod";

import {
  ChangePasswordSchema,
  ClientSignupSchema,
  LoginSchema,
  OtpLoginSchema,
  RequestClientSignupOtpSchema,
  RequestOtpLoginSchema,
  SignupSchema,
} from "../validators/auth.validator";

export type SignupInput = z.output<typeof SignupSchema>;

export type LoginInput = z.output<typeof LoginSchema>;

export type RequestOtpLoginInput = z.output<typeof RequestOtpLoginSchema>;

export type OtpLoginInput = z.output<typeof OtpLoginSchema>;

export type ChangePasswordInput = z.output<typeof ChangePasswordSchema>;

export type RequestClientSignupOtpInput = z.output<
  typeof RequestClientSignupOtpSchema
>;

export type ClientSignupInput = z.output<typeof ClientSignupSchema>;
