import { Request, Response } from "express";
import { NewChirp } from "../db/schema.js";
import {
  createChirp,
  deleteChirpById,
  getChirps,
  getChirpsbyAuthorId,
  getChirpsbyChirpId,
} from "../db/queries/chirps.js";
import {
  respondeWithoutContent,
  respondWithError,
  respondWithJSON,
} from "./json.js";
import { validateChirp } from "./validateChirp.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";

export async function handlerCreateChirp(req: Request, res: Response) {
  if (!req.body) {
    respondWithError(res, 400, "Missing request body");
    return;
  }

  const token = getBearerToken(req);
  if (!token) {
    respondWithError(res, 401, "Missing or invalid Authorization header");
    return;
  }

  const isValidUserId = validateJWT(token, config.api.secret); // returns userId if valid, throws error if invalid (schaue bei makeJWT und validateJWT nach)
  if (!isValidUserId) {
    respondWithError(res, 401, "Invalid token");
    return;
  }

  //console.log("Received chirp:", req.body);

  const sanitizedBody = validateChirp(req.body.body);

  //console.log("Sanitized chirp body:", sanitizedBody);

  const chirp: NewChirp = {
    userId: isValidUserId,
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
  //console.log("Received request for chirps with params:", req.params);
  const authorId = req.query.authorId as string | undefined;
  const sortBy = req.query.sort as string | undefined;
  //console.log("Received authorId:", authorId);
  if (authorId) {
    try {
      if (typeof authorId !== "string") {
        respondWithError(res, 400, "Invalid authorId parameter");
        return;
      }
      //console.log("Fetching chirps for authorId:", authorId);
      const result = await getChirpsbyAuthorId(authorId);
      if (!result) {
        respondWithError(res, 404, "No chirps found for this author");
        return;
      }
      respondWithJSON(res, 200, result);
    } catch (err) {
      respondWithError(res, 500, "Internal Server Error");
    }
  } else if (sortBy) {
    try {
      if (sortBy !== "asc" && sortBy !== "desc") {
        respondWithError(res, 400, "Invalid sort parameter");
        return;
      }
      //console.log("Fetching chirps sorted by:", sortBy);
      const result = await getChirps();
      if (!result) {
        respondWithError(res, 404, "No chirps found");
        return;
      }
      if (sortBy === "asc") {
        result.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      } else if (sortBy === "desc") {
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      } else {
        respondWithError(res, 400, "Invalid sort parameter");
        return;
      }
      respondWithJSON(res, 200, result);
    } catch (err) {
      respondWithError(res, 500, "Internal Server Error");
    }
  } else {
    console.log("Fetching all chirps");
    try {
      const result = await getChirps();
      if (!result) {
        respondWithError(res, 404, "No chirps found");
        return;
      }
      respondWithJSON(res, 200, result);
    } catch (err) {
      respondWithError(res, 500, "Internal Server Error");
    }
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
    if (result) {
      respondWithJSON(res, 200, result);
    } else {
      respondWithError(res, 404, "Chirp not found");
    }
  } catch (err) {
    respondWithError(res, 500, "Internal Server Error");
  }
}

export async function handlerDeleteChirp(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    respondWithError(res, 401, "Missing or invalid Authorization header");
    return;
  }
  const accessToken = authHeader.split(" ")[1]; // Bearer <token>
  if (!accessToken) {
    respondWithError(res, 401, "Missing token");
    return;
  }
  const userId = validateJWT(accessToken, config.api.secret);
  if (!userId) {
    respondWithError(res, 401, "Invalid token");
    return;
  }

  const chirpId = req.params.chirpId;
  if (!chirpId) {
    respondWithError(res, 400, "Missing chirpId parameter");
    return;
  }

  if (typeof chirpId !== "string") {
    respondWithError(res, 400, "Invalid chirpId parameter");
    return;
  }

  const chirp = await getChirpsbyChirpId(chirpId);
  if (!chirp) {
    respondWithError(res, 404, "Chirp not found");
    return;
  }

  if (userId !== chirp.userId) {
    respondWithError(
      res,
      403,
      "Forbidden: You can only delete your own chirps",
    );
    return;
  }

  try {
    const result = await deleteChirpById(chirpId);
    if (result) {
      respondeWithoutContent(res, 204);
    } else {
      respondWithError(res, 404, "Chirp not found");
    }
  } catch (err) {
    respondWithError(res, 500, "Internal Server Error");
  }
}
