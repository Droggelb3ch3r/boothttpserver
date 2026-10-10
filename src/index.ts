import express, { type Express } from "express";
import { middlewareLogResponse } from "./api/middleware/logging.js";
import { middlewareMetricsInc } from "./api/middleware/serverHits.js";
import { handlerReadiness } from "./api/readiness.js";
import { handlerRequestcount } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";

const app: Express = express();
const PORT = 8080;

function main() {
  app.use(middlewareLogResponse);

  app.use("/app", middlewareMetricsInc, express.static("./src/app"));

  app.get("/api/healthz", handlerReadiness);
  app.get("/api/metrics", handlerRequestcount);
  app.get("/api/reset", handlerReset);

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/app`);
  });
}

main();
