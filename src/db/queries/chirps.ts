import { db } from "../index.js";
import { eq } from "drizzle-orm";
import { NewChirp, chirps } from "../schema.js";

export async function createChirp(chirp: NewChirp) {
  const [result] = await db.insert(chirps).values(chirp).returning();
  //console.log("Inserted chirp:", result);
  return result;
}

export async function getChirps() {
  const result = await db.select().from(chirps).orderBy(chirps.createdAt);
  //console.log("Retrieved chirps:", result);
  return result;
}

export async function getChirpsbyChirpId(chirpId: string) {
  const result = await db.select().from(chirps).where(eq(chirps.id, chirpId));
  //console.log("Retrieved chirp by ID:", result);
  return result;
}
