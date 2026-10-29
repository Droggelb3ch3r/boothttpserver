import express, { type Express } from "express";
import { middlewareLogResponse } from "./api/middleware/logging.js";
import { middlewareMetricsInc } from "./api/middleware/serverHits.js";
import { errorHandler } from "./api/middleware/errorhandle.js";
import { handlerReadiness } from "./api/readiness.js";
import { handlerRequestcount } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import { handlerCreateUser, handlerUpdateUser } from "./api/users.js";
import { handlerLogin } from "./api/login.js";
import {
  handlerCreateChirp,
  handlerDeleteChirp,
  handlerGetChirps,
  handlerGetChirpsByChirpId,
} from "./api/chirps.js";
import {
  handlerRefreshToken,
  handlerRevokeRefreshToken,
} from "./api/refresh.js";
import { config } from "./config.js";
import { runMigration } from "./db/migrate.js";
import { handlerUpdateToChirpyRed } from "./api/chirpyred.js";

const app: Express = express();
const PORT = config.api.port;

function main() {
  app.use(middlewareLogResponse);
  app.use(express.json());

  app.use("/app", middlewareMetricsInc, express.static("./src/app"));

  app.get("/api/healthz", (req, res, next) => {
    Promise.resolve(handlerReadiness(req, res)).catch(next);
  });
  app.get("/admin/metrics", (req, res, next) => {
    Promise.resolve(handlerRequestcount(req, res)).catch(next);
  });
  app.get("/api/chirps", (req, res, next) => {
    Promise.resolve(handlerGetChirps(req, res)).catch(next);
  });
  app.get("/api/chirps/:chirpId", (req, res, next) => {
    Promise.resolve(handlerGetChirpsByChirpId(req, res)).catch(next);
  });

  app.post("/admin/reset", (req, res, next) => {
    Promise.resolve(handlerReset(req, res)).catch(next);
  });
  app.post("/api/users", (req, res, next) => {
    Promise.resolve(handlerCreateUser(req, res)).catch(next);
  });
  app.post("/api/login", (req, res, next) => {
    Promise.resolve(handlerLogin(req, res)).catch(next);
  });
  app.post("/api/chirps", (req, res, next) => {
    Promise.resolve(handlerCreateChirp(req, res)).catch(next);
  });
  app.post("/api/refresh", (req, res, next) => {
    Promise.resolve(handlerRefreshToken(req, res)).catch(next);
  });
  app.post("/api/revoke", (req, res, next) => {
    Promise.resolve(handlerRevokeRefreshToken(req, res)).catch(next);
  });
  app.post("/api/polka/webhooks", (req, res, next) => {
    Promise.resolve(handlerUpdateToChirpyRed(req, res)).catch(next);
  });

  app.put("/api/users", (req, res, next) => {
    Promise.resolve(handlerUpdateUser(req, res)).catch(next);
  });

  app.delete("/api/chirps/:chirpId", (req, res, next) => {
    Promise.resolve(handlerDeleteChirp(req, res)).catch(next);
  });

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
await runMigration();
main();
