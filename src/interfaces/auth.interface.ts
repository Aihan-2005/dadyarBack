import type { z } from "zod";

import type {
  OtpLoginSchema,
  RequestOtpLoginSchema,
} from "../validators/auth.validator";

export type RequestOtpLoginInput = z.infer<typeof RequestOtpLoginSchema>;

export type OtpLoginInput = z.infer<typeof OtpLoginSchema>;
