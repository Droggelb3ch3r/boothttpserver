import { BadRequestError } from "./middleware/errors.js";

const bannedWords = ["kerfuffle", "sharbert", "fornax"];

export function validateChirp(chirpBody: string): string {
  const maxChirpLength = 140;

  if (chirpBody.length > maxChirpLength) {
    throw new BadRequestError(
      `Chirp is too long. Max length is ${maxChirpLength}`,
    );
  }

  // If the chirp fits within the limit:

  const chirpArray = chirpBody.split(" ");
  for (const word of chirpArray) {
    if (bannedWords.includes(word.toLowerCase())) {
      chirpArray[chirpArray.indexOf(word)] = "****";
    }
  }

  const sanitizedChirp = chirpArray.join(" ");
  //respondWithJSON(res, 200, { cleanedBody: sanitizedChirp });
  return sanitizedChirp;
}
