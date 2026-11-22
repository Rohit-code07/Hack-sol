import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { demoRole } from "./middleware/demoRole.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { requestLogger } from "./middleware/requestLogger.js";
import routes from "./routes/index.js";

const JSON_BODY_LIMIT = "100kb";
const API_PREFIX = "/api";

/**
 * Builds the Express app with middleware, routes and error handling.
 *
 * @returns {import("express").Express}
 */
export function createApp() {
  const app = express();

  app.use(cors({ origin: env.CLIENT_ORIGIN }));
  app.use(express.json({ limit: JSON_BODY_LIMIT }));
  app.use(requestLogger);
  app.use(demoRole);
  app.use(API_PREFIX, routes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}