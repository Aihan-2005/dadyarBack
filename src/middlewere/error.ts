import { NextFunction, Request, Response } from "express";
import { HttpExceptoin } from "../exceptions/httpException";
import { ZodError } from "zod";
import { MESSAGES } from "../constants/messages";
import { env } from "../config/env";

const LANGUAGE = env.LANGUAGE;

const errorHandler = (
  error: HttpExceptoin | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof HttpExceptoin) {
    console.error(
      `error with status:${error.status || 500} with message:${error.message}`,
    );
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  } else if (error instanceof ZodError) {
    res.status(400).json({ success: false, issues: error.issues });
  } else {
    console.error(`an unexcpected error happend`, error);
    res
      .status(500)
      .json({ sucess: false, message: MESSAGES.serverError[LANGUAGE] });
  }
};

export default errorHandler;
