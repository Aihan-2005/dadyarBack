import type { z } from "zod";

import type {
  ChangePasswordSchema,
  OtpLoginSchema,
  RequestOtpLoginSchema,
} from "../validators/auth.validator";

export type RequestOtpLoginInput = z.infer<typeof RequestOtpLoginSchema>;

export type OtpLoginInput = z.infer<typeof OtpLoginSchema>;

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
