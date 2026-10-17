import { db } from "../index.js";
import { users } from "../schema.js";
import { config } from "../../config.js";
import { UserForbiddenError } from "../../api/middleware/errors.js";

export async function resetDB() {
  if (config.api.platform !== "dev") {
    throw new UserForbiddenError(
      "Database reset is only allowed in development environment",
    );
  }

  const result = await db.delete(users).execute();
  //console.log("Deleted:", result);
  return result;
}
