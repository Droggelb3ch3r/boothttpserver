import { Request, Response } from "express";
import { createUser } from "../db/queries/users.js";
import { respondWithJSON } from "./json.js";
import { BadRequestError } from "./middleware/errors.js";
import { hashPassword } from "../auth.js";
import { NewUser } from "../db/schema.js";

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
  } satisfies UserResponse);
}
