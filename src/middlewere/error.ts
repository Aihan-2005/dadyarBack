import type {
  NextFunction,
  Request,
  Response,
} from "express";

import mongoose from "mongoose";
import { ZodError } from "zod";

import {
  env,
} from "../config/env";

import {
  MESSAGES,
} from "../constants/messages";

import {
  HttpExceptoin,
} from "../exceptions/httpException";

type MongoDuplicateError =
  Error & {
    code: 11000;

    keyValue?: Record<
      string,
      unknown
    >;
  };

function isMongoDuplicateError(
  error: unknown,
): error is MongoDuplicateError {
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
  if (
    error instanceof
    HttpExceptoin
  ) {
    return res
      .status(error.status)
      .json({
        success: false,

        code:
          error.code,

        message:
          error.message,

        ...(error.details !==
        undefined
          ? {
              details:
                error.details,
            }
          : {}),
      });
  }

  if (
    error instanceof
    ZodError
  ) {
    return res
      .status(400)
      .json({
        success: false,

        code:
          "VALIDATION_ERROR",

        message:
          env.LANGUAGE === "fa"
            ? "اطلاعات ارسال‌شده معتبر نیست"
            : "The submitted data is invalid",

        issues:
          error.issues.map(
            (issue) => ({
              path:
                issue.path.join(
                  ".",
                ),

              message:
                issue.message,
            }),
          ),
      });
  }

  if (
    isMongoDuplicateError(
      error,
    )
  ) {
    const field =
      error.keyValue
        ? Object.keys(
            error.keyValue,
          )[0]
        : undefined;

    return res
      .status(409)
      .json({
        success: false,

        code:
          "DUPLICATE_RESOURCE",

        message:
          MESSAGES.duplicateField[
            env.LANGUAGE
          ],

        ...(field
          ? {
              field,
            }
          : {}),
      });
  }

  if (
    error instanceof
    mongoose.Error.CastError
  ) {
    return res
      .status(400)
      .json({
        success: false,

        code:
          "INVALID_IDENTIFIER",

        message:
          MESSAGES.invalidObjectId[
            env.LANGUAGE
          ],
      });
  }

  if (
    error instanceof
    mongoose.Error.ValidationError
  ) {
    return res
      .status(400)
      .json({
        success: false,

        code:
          "DATABASE_VALIDATION_ERROR",

        message:
          env.LANGUAGE === "fa"
            ? "اطلاعات با ساختار مورد انتظار سازگار نیست"
            : "The data does not match the expected structure",
      });
  }

  console.error(
    "Unexpected server error:",
    error,
  );

  return res
    .status(500)
    .json({
      success: false,

      code:
        "INTERNAL_SERVER_ERROR",

      message:
        MESSAGES.serverError[
          env.LANGUAGE
        ],
    });
};

export default errorHandler;