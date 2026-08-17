import type { Request, Response } from "express";

import { rateLimit } from "express-rate-limit";

import { env } from "../config/env";

const rateLimitMessage =
  env.LANGUAGE === "fa"
    ? "تعداد درخواست‌ها بیش از حد مجاز است؛ کمی بعد دوباره تلاش کنید"
    : "Too many requests; please try again later";

function sendRateLimitResponse(_req: Request, res: Response) {
  return res.status(429).json({
    success: false,

    code: "TOO_MANY_REQUESTS",

    message: rateLimitMessage,
  });
}

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 10,

  standardHeaders: true,

  legacyHeaders: false,

  skipSuccessfulRequests: true,

  handler: sendRateLimitResponse,
});

export const signupRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,

  max: 5,

  standardHeaders: true,

  legacyHeaders: false,

  handler: sendRateLimitResponse,
});

export const refreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 30,

  standardHeaders: true,

  legacyHeaders: false,

  handler: sendRateLimitResponse,
});

export const otpRequestRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 10,

  standardHeaders: true,

  legacyHeaders: false,

  handler: sendRateLimitResponse,
});

export const otpLoginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 20,

  standardHeaders: true,

  legacyHeaders: false,

  skipSuccessfulRequests: true,

  handler: sendRateLimitResponse,
});

