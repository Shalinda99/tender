import { Router } from "express";
import { isLive } from "../services/paypal.js";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({ ok: true, service: "tender-api", time: new Date().toISOString() });
});

healthRouter.get("/mode", (_req, res) => {
  res.json({ paypal: isLive() ? "live" : "mock" });
});
