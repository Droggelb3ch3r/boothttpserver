import { Request, Response } from "express";
import { config } from "../config.js";

export async function handlerRequestcount(_: Request, res: Response) {
  res.send(`Hits: ${config.fileserverHits}`);
}
