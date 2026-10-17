import { Request, Response } from "express";
import { NewChirp } from "../db/schema.js";
import {
  createChirp,
  getChirps,
  getChirpsbyChirpId,
} from "../db/queries/chirps.js";
import { respondWithError, respondWithJSON } from "./json.js";
import { validateChirp } from "./validateChirp.js";
import { array } from "stream/iter";

export async function handlerCreateChirp(req: Request, res: Response) {
  if (!req.body.userId || !req.body.body) {
    respondWithError(res, 400, "Missing required fields");
    return;
  }
  //console.log("Received chirp:", req.body);

  const sanitizedBody = validateChirp(req.body.body);

  //console.log("Sanitized chirp body:", sanitizedBody);

  const chirp: NewChirp = {
    userId: req.body.userId,
    body: sanitizedBody,
  };

  //console.log("Chirp object to be saved:", chirp);

  try {
    const result = await createChirp(chirp);
    //console.log("Chirp saved?:", result);

    if (result) {
      respondWithJSON(res, 201, result);
    } else {
      respondWithError(res, 400, "Failed to save chirp");
    }
  } catch (err) {
    respondWithError(res, 500, "Internal Server Error");
  }
}

export async function handlerGetChirps(req: Request, res: Response) {
  try {
    const result = await getChirps();
    respondWithJSON(res, 200, result);
  } catch (err) {
    respondWithError(res, 500, "Internal Server Error");
  }
}

export async function handlerGetChirpsByChirpId(req: Request, res: Response) {
  const chirpId = req.params.chirpId;
  if (!chirpId) {
    respondWithError(res, 400, "Missing chirpId parameter");
    return;
  }

  if (typeof chirpId !== "string") {
    respondWithError(res, 400, "Invalid chirpId parameter");
    return;
  }

  //console.log("Received chirpId:", chirpId);
  try {
    const result = await getChirpsbyChirpId(chirpId);
    if (result.length > 0) {
      respondWithJSON(res, 200, result[0]);
    } else {
      respondWithError(res, 404, "Chirp not found");
    }
  } catch (err) {
    respondWithError(res, 500, "Internal Server Error");
  }
}
