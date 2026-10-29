import { Request, Response } from "express";
import { respondWithJSON, respondWithError } from "./json.js";
import { BadRequestError } from "./middleware/errors.js";
import { checkPasswordHash, makeRefreshToken } from "../auth.js";
import { getUserByEmail } from "../db/queries/users.js";
import { makeJWT } from "../auth.js";
import { config } from "../config.js";

export async function handlerLogin(req: Request, res: Response) {
  type parameters = {
    password: string;
    email: string;
  };
  const params: parameters = req.body;
  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required fields");
  }

  const user = await getUserByEmail(params.email);

  if (!user) {
    throw new BadRequestError("User not found");
  }

  const isPasswordValid = await checkPasswordHash(
    params.password,
    user.hashedPassword,
  );

  if (!isPasswordValid) {
    respondWithError(res, 401, "Invalid password");
    return;
  }

  const tokenExpiresInSeconds = 3600; // 1 hour
  const refreshTokenExpiresInSeconds = 60 * 60 * 24 * 60; // 60 days in seconds

  const token = makeJWT(user.id, tokenExpiresInSeconds, config.api.secret);
  const refreshToken = await makeRefreshToken(
    user.id,
    refreshTokenExpiresInSeconds,
  );

  respondWithJSON(res, 200, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    token: token,
    refreshToken: refreshToken,
    isChirpyRed: user.isChirpyRed,
  });
}
