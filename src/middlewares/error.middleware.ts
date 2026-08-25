import type { NextFunction, Request, Response } from "express";

import mongoose from "mongoose";
import multer from "multer";
import { ZodError } from "zod";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";

import { HttpException } from "../exceptions/httpException";

const LANGUAGE = env.LANGUAGE;

type MongoDuplicateError = Error & {
  code: 11000;

  keyPattern?: Record<string, number>;

  keyValue?: Record<string, unknown>;
};

function isMongoDuplicateError(error: unknown): error is MongoDuplicateError {
  return (
    error instanceof Error &&
    "code" in error &&
    (
      error as {
        code?: unknown;
      }
    ).code === 11000
  );
}

const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof HttpException) {
    return res.status(error.status).json({
      success: false,

      code: error.code,

      message: error.message,

      ...(error.details !== undefined
        ? {
            details: error.details,
          }
        : {}),
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,

      code: "VALIDATION_ERROR",

      message: MESSAGES.validationError[LANGUAGE],

      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),

        message: issue.message,
      })),
    });
  }

  if (isMongoDuplicateError(error)) {
    const duplicateFields = Object.keys(
      error.keyPattern ?? error.keyValue ?? {},
    );

    const field =
      duplicateFields.find((key) => key !== "lawyerId") ?? duplicateFields[0];

    if (duplicateFields.includes("caseNumber")) {
      return res.status(409).json({
        success: false,

        code: "CASE_NUMBER_ALREADY_EXISTS",

        message: MESSAGES.caseNumberAlreadyExists[LANGUAGE],

        field: "caseNumber",
      });
    }

    return res.status(409).json({
      success: false,

      code: "DUPLICATE_RESOURCE",

      message: MESSAGES.duplicateField[LANGUAGE],

      ...(field
        ? {
            field,
          }
        : {}),
    });
  }

  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,

      code: "INVALID_IDENTIFIER",

      message: MESSAGES.invalidObjectId[LANGUAGE],
    });
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      success: false,

      code: "DATABASE_VALIDATION_ERROR",

      message: MESSAGES.databaseValidationError[LANGUAGE],
    });
  }

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,

        code: "ATTACHMENT_TOO_LARGE",

        message: MESSAGES.attachmentTooLarge[LANGUAGE],
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,

        code: "TOO_MANY_ATTACHMENTS",

        message: MESSAGES.tooManyAttachments[LANGUAGE],
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,

        code: "UNEXPECTED_ATTACHMENT",

        message: MESSAGES.unexpectedAttachment[LANGUAGE],
      });
    }

    return res.status(400).json({
      success: false,

      code: "INVALID_ATTACHMENT",

      message: MESSAGES.invalidAttachment[LANGUAGE],
    });
  }

  console.error("Unexpected server error:", error);

  return res.status(500).json({
    success: false,

    code: "INTERNAL_SERVER_ERROR",

    message: MESSAGES.serverError[LANGUAGE],
  });
};

export default errorHandler;
