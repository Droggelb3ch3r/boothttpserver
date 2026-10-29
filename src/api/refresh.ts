import { Request, Response } from "express";
import {
  respondWithError,
  respondWithJSON,
  respondeWithoutContent,
} from "./json.js";
import { BadRequestError } from "./middleware/errors.js";
import { getRefreshToken, revokeRefreshToken } from "../db/queries/token.js";
import { makeJWT } from "../auth.js";
import { config } from "../config.js";

export async function handlerRefreshToken(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new BadRequestError("Missing or invalid Authorization header");
  }

  const refreshToken = authHeader.split(" ")[1];
  const existingToken = await getRefreshToken(refreshToken);

  if (!existingToken) {
    throw new BadRequestError("Invalid refresh token");
  }

  if (existingToken.expiresAt < new Date()) {
    respondWithError(res, 401, "Refresh token has expired");
    return;
  }

  if (existingToken.revokedAt) {
    respondWithError(res, 401, "Refresh token has been revoked");
    return;
  }

  const tokenExpiresInSeconds = 3600; // 1 hour
  const newToken = makeJWT(
    existingToken.userId,
    tokenExpiresInSeconds,
    config.api.secret,
  );

  respondWithJSON(res, 200, { token: newToken });
}

export async function handlerRevokeRefreshToken(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new BadRequestError("Missing or invalid Authorization header");
  }

  const refreshToken = authHeader.split(" ")[1];
  const existingToken = await getRefreshToken(refreshToken);

  if (!existingToken) {
    throw new BadRequestError("Invalid refresh token");
  }

  const revokedToken = await revokeRefreshToken(refreshToken);
  if (!revokedToken) {
    throw new BadRequestError("Failed to revoke refresh token");
  }
  respondeWithoutContent(res, 204);
}
