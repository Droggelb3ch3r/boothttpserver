import argon2 from "argon2";
import type { Request } from "express";
import crypto from "crypto";

import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import {
  BadRequestError,
  UserNotAuthenticatedError,
} from "./api/middleware/errors.js";
import { createRefreshToken } from "./db/queries/token.js";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export async function hashPassword(password: string): Promise<string> {
  try {
    const hash = await argon2.hash(password);
    return hash;
  } catch (err) {
    throw new Error("Error hashing password");
  }
}

export async function checkPasswordHash(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    if (await argon2.verify(hash, password)) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    throw new Error("Error verifying password");
  }
}

export function makeJWT(
  userID: string,
  expiresIn: number,
  secret: string,
): string {
  const payload: payload = {
    iss: "chripy",
    sub: userID,
    iat: Math.floor(Date.now() / 1000), // current time in seconds (1 hour = 3600 seconds)
    exp: Math.floor(Date.now() / 1000) + expiresIn,
  };
  return jwt.sign(payload, secret);
}

export function validateJWT(tokenString: string, secret: string): string {
  try {
    const decoded = jwt.verify(tokenString, secret) as payload;
    if (!decoded.sub) {
      throw new BadRequestError("Invalid token: missing subject");
    }
    return decoded.sub;
  } catch (err) {
    throw new UserNotAuthenticatedError("Invalid token");
  }
}

export function getBearerToken(req: Request): string {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new BadRequestError("Missing Authorization header");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new BadRequestError("Missing token");
  }
  return token;
}

export async function makeRefreshToken(
  userID: string,
  expiresIn: number,
): Promise<string> {
  if (!userID) {
    throw new BadRequestError("Missing userID for refresh token");
  }

  const token = crypto.randomBytes(32).toString("hex");

  const refreshToken = {
    token: token,
    expiresAt: new Date(Date.now() + expiresIn * 1000), // convert to milliseconds
    userId: userID,
  };
  const result = await createRefreshToken(refreshToken);
  if (!result) {
    throw new BadRequestError("Failed to create refresh token");
  }
  return result.token;
}

export async function getAPIKey(req: Request): Promise<string> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("ApiKey ")) {
    throw new UserNotAuthenticatedError(
      "Missing or invalid Authorization header",
    );
  }
  const apiKey = authHeader.split(" ")[1]; // Bearer <apiKey>
  if (!apiKey || typeof apiKey !== "string") {
    throw new UserNotAuthenticatedError("Missing or invalid API key");
  }
  return apiKey;
}
