import { describe, it, expect, beforeAll } from "vitest";
import {
  makeJWT,
  validateJWT,
  hashPassword,
  checkPasswordHash,
} from "../src/auth.js";

describe("Password hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });

  it("should return false for incorrect password", async () => {
    const result = await checkPasswordHash(password2, hash1);
    expect(result).toBe(false);
  });

  it("should return true for correct password with different hash", async () => {
    const result = await checkPasswordHash(password2, hash2);
    expect(result).toBe(true);
  });

  it("should return false for incorrect password with different hash", async () => {
    const result = await checkPasswordHash(password1, hash2);
    expect(result).toBe(false);
  });
});

describe("JWT generation and validation", () => {
  const userID = "testuser123";
  let expiresIn = 60; // 1 minute
  const secret = "supersecretkey";
  let token: string;

  beforeAll(() => {
    token = makeJWT(userID, expiresIn, secret);
  });

  it("should generate a valid JWT", () => {
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
  });

  it("should validate the JWT and return the correct user ID", () => {
    const validatedUserID = validateJWT(token, secret);
    expect(validatedUserID).toBe(userID);
  });

  it("should throw an error for an invalid JWT", () => {
    const invalidToken = token + "invalid";
    expect(() => validateJWT(invalidToken, secret)).toThrow("Invalid token");
  });

  it("should throw an error for a JWT with a different secret", () => {
    const differentSecret = "differentsecretkey";
    expect(() => validateJWT(token, differentSecret)).toThrow("Invalid token");
  });

  it("should throw an error for an expired JWT", () => {
    // Create a token that expires immediately
    const expiredToken = makeJWT(userID, -10, secret);
    expect(() => validateJWT(expiredToken, secret)).toThrow("Invalid token");
  });
});
