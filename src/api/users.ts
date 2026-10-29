import { Request, Response } from "express";
import { createUser, updateUser } from "../db/queries/users.js";
import { respondWithJSON } from "./json.js";
import {
  BadRequestError,
  UserNotAuthenticatedError,
} from "./middleware/errors.js";
import { hashPassword, validateJWT } from "../auth.js";
import { NewUser } from "../db/schema.js";
import { config } from "../config.js";

export type UserResponse = Omit<NewUser, "hashedPassword">;

export async function handlerCreateUser(req: Request, res: Response) {
  type parameters = {
    password: string;
    email: string;
  };
  const params: parameters = req.body;
  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required fields");
  }

  const hashedPassw = await hashPassword(params.password);

  const user = await createUser({
    email: params.email,
    hashedPassword: hashedPassw,
  } satisfies NewUser);

  if (!user) {
    throw new Error("Could not create user");
  }

  respondWithJSON(res, 201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isChirpyRed: user.isChirpyRed,
  } satisfies UserResponse);
}

export async function handlerUpdateUser(req: Request, res: Response) {
  type parameters = {
    password: string;
    email: string;
  };
  const params: parameters = req.body;
  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required fields");
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UserNotAuthenticatedError(
      "Missing or invalid Authorization header",
    );
  }
  const accessToken = authHeader.split(" ")[1]; // Bearer <token>
  if (!accessToken) {
    throw new UserNotAuthenticatedError("Missing token");
  }
  const userId = validateJWT(accessToken, config.api.secret);
  if (!userId) {
    throw new UserNotAuthenticatedError("Invalid token");
  }

  const hashedPassw = await hashPassword(params.password);

  const user = await updateUser(userId, {
    email: params.email,
    hashedPassword: hashedPassw,
  } satisfies Partial<NewUser>);

  if (!user) {
    throw new Error("Could not update user");
  }

  respondWithJSON(res, 200, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isChirpyRed: user.isChirpyRed,
  } satisfies UserResponse);
}
