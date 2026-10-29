import { Request, Response } from "express";
import {
  createUser,
  updateUser,
  upgradeIsChirpyRedUser,
} from "../db/queries/users.js";
import {
  respondeWithoutContent,
  respondWithError,
  respondWithJSON,
} from "./json.js";
import {
  BadRequestError,
  UserNotAuthenticatedError,
} from "./middleware/errors.js";
import {
  getAPIKey,
  getBearerToken,
  hashPassword,
  validateJWT,
} from "../auth.js";
import { NewUser } from "../db/schema.js";
import { config } from "../config.js";

export async function handlerUpdateToChirpyRed(req: Request, res: Response) {
  type parameters = {
    event: string;
    data: {
      userId: string;
    };
  };

  const params: parameters = req.body;
  if (!params.event || !params.data.userId) {
    throw new BadRequestError("Missing required fields");
  }

  if (params.event !== "user.upgraded") {
    respondeWithoutContent(res, 204);
    return;
  }

  const apiKey = await getAPIKey(req);
  if (!apiKey || apiKey !== config.api.polkaKey) {
    respondWithError(res, 401, "No API key provided or invalid API key");
    return;
  }

  try {
    const result = await upgradeIsChirpyRedUser(params.data.userId);
    if (result) {
      respondeWithoutContent(res, 204);
      return;
    } else {
      respondWithError(res, 404, "User not found");
      return;
    }
  } catch (err) {
    respondWithError(res, 500, "Internal Server Error");
    return;
  }
}
