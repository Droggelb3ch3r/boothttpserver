import { loadEnvFile } from "node:process";
import type { MigrationConfig } from "drizzle-orm/migrator";

// utility function to load environment variables and throw an error if a required variable is missing
function loadEnvOrThrow(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

loadEnvFile(".env");

// Define the configuration types for the application
export type APIConfig = {
  fileserverHits: number;
  port: number;
  platform: string;
};

export type DBConfig = {
  migrationConfig: MigrationConfig;
  url: string;
};

// Define the overall configuration type for the application
const migrationConfig: MigrationConfig = {
  migrationsFolder: "src/db/generated",
};

export const config = {
  api: {
    fileserverHits: 0,
    port: parseInt(loadEnvOrThrow("PORT"), 10),
    platform: loadEnvOrThrow("PLATFORM"),
  },
  db: {
    migrationConfig: migrationConfig,
    url: loadEnvOrThrow("DB_URL"),
  },
};
