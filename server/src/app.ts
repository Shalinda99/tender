import express from "express";
import cors from "cors";
import { corsOrigins } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/error-handler.js";

/** Builds the Express application (no network binding — see server.ts). */
export function createApp() {
  const app = express();

  app.use(cors({ origin: corsOrigins.includes("*") ? true : corsOrigins }));
  app.use(express.json());

  app.use(apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
