import { Request, Response, NextFunction } from "express";
import { config } from "../../config.js";

export function middlewareMetricsInc(
  _: Request,
  __: Response,
  next: NextFunction,
) {
  // Increment the counter for the number of hits to the file server
  config.fileserverHits++;
  next();
}
