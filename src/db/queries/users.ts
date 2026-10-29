import { db } from "../index.js";
import { NewUser, users } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  //console.log("Inserted user:", result);
  return result;
}

export async function getUserByEmail(mail: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, mail))
    .execute();
  return user;
}

export async function updateUser(
  userId: string,
  updatedFields: Partial<NewUser>,
) {
  const [updatedUser] = await db
    .update(users)
    .set(updatedFields)
    .where(eq(users.id, userId))
    .returning();
  return updatedUser;
}

export async function upgradeIsChirpyRedUser(userId: string) {
  const [updateUser] = await db
    .update(users)
    .set({ isChirpyRed: true })
    .where(eq(users.id, userId))
    .returning();
  return updateUser;
}
