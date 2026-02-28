import { NextFunction, Request, Response } from "express";
import { HttpExceptoin } from "../exceptions/httpException";


const errorHandler = (error: HttpExceptoin, _req: Request, res: Response, _next: NextFunction) => {
  console.error(`error with status:${error.status || 500} with message:${error.message}`)
  return void res.status(error.status || 500).json({ success: false, message: error.message })
}

export default errorHandler;
