import { Request, Response } from "express";

import { config } from "../config.js";
import { resetDB } from "../db/queries/resetdb.js";

export async function handlerReset(_: Request, res: Response) {
  await resetDB();
  config.api.fileserverHits = 0;
  res.write("Hits reset to 0\n");
  res.end();
}
