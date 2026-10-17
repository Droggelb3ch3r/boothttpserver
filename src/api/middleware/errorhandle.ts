import { Request, Response, NextFunction } from "express";
import { respondWithError } from "../json.js";
import {
  BadRequestError,
  UserNotAuthenticatedError,
  UserForbiddenError,
  NotFoundError,
} from "./errors.js";

export function errorHandler(
  err: Error,
  _: Request,
  res: Response,
  __: NextFunction,
) {
  let statusCode = 500;
  let message = "Something went wrong on our end";

  if (err instanceof BadRequestError) {
    statusCode = 400;
    message = err.message;
  } else if (err instanceof UserNotAuthenticatedError) {
    statusCode = 401;
    message = err.message;
  } else if (err instanceof UserForbiddenError) {
    statusCode = 403;
    message = err.message;
  } else if (err instanceof NotFoundError) {
    statusCode = 404;
    message = err.message;
  }

  if (statusCode >= 500) {
    console.log(err.message);
  }

  //console.log(`[ERROR] ${message} - Status: ${statusCode}`);
  respondWithError(res, statusCode, message);
}
