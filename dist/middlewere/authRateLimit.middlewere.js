"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshRateLimiter = exports.signupRateLimiter = exports.loginRateLimiter = void 0;
const express_rate_limit_1 = require("express-rate-limit");
const env_1 = require("../config/env");
const rateLimitMessage = env_1.env.LANGUAGE === "fa"
    ? "تعداد درخواست‌ها بیش از حد مجاز است؛ کمی بعد دوباره تلاش کنید"
    : "Too many requests; please try again later";
function sendRateLimitResponse(_req, res) {
    return res
        .status(429)
        .json({
        success: false,
        code: "TOO_MANY_REQUESTS",
        message: rateLimitMessage,
    });
}
exports.loginRateLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: sendRateLimitResponse,
});
exports.signupRateLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: sendRateLimitResponse,
});
exports.refreshRateLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    handler: sendRateLimitResponse,
});
