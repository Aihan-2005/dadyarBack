"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const env_1 = require("../config/env");
const messages_1 = require("../constants/messages");
const httpException_1 = require("../exceptions/httpException");
function isMongoDuplicateError(error) {
    return (error instanceof Error &&
        "code" in error &&
        error.code === 11000);
}
const errorHandler = (error, _req, res, _next) => {
    if (error instanceof
        httpException_1.HttpExceptoin) {
        return res
            .status(error.status)
            .json({
            success: false,
            code: error.code,
            message: error.message,
            ...(error.details !==
                undefined
                ? {
                    details: error.details,
                }
                : {}),
        });
    }
    if (error instanceof
        zod_1.ZodError) {
        return res
            .status(400)
            .json({
            success: false,
            code: "VALIDATION_ERROR",
            message: env_1.env.LANGUAGE === "fa"
                ? "اطلاعات ارسال‌شده معتبر نیست"
                : "The submitted data is invalid",
            issues: error.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
            })),
        });
    }
    if (isMongoDuplicateError(error)) {
        const field = error.keyValue
            ? Object.keys(error.keyValue)[0]
            : undefined;
        return res
            .status(409)
            .json({
            success: false,
            code: "DUPLICATE_RESOURCE",
            message: messages_1.MESSAGES.duplicateField[env_1.env.LANGUAGE],
            ...(field
                ? {
                    field,
                }
                : {}),
        });
    }
    if (error instanceof
        mongoose_1.default.Error.CastError) {
        return res
            .status(400)
            .json({
            success: false,
            code: "INVALID_IDENTIFIER",
            message: messages_1.MESSAGES.invalidObjectId[env_1.env.LANGUAGE],
        });
    }
    if (error instanceof
        mongoose_1.default.Error.ValidationError) {
        return res
            .status(400)
            .json({
            success: false,
            code: "DATABASE_VALIDATION_ERROR",
            message: env_1.env.LANGUAGE === "fa"
                ? "اطلاعات با ساختار مورد انتظار سازگار نیست"
                : "The data does not match the expected structure",
        });
    }
    console.error("Unexpected server error:", error);
    return res
        .status(500)
        .json({
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        message: messages_1.MESSAGES.serverError[env_1.env.LANGUAGE],
    });
};
exports.default = errorHandler;
