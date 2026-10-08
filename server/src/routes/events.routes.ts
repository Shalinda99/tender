import { Router } from "express";
import { prisma, json } from "../lib/prisma.js";
import { asyncHandler } from "../lib/async-handler.js";
import { addClient, removeClient } from "../lib/events.js";

export const eventsRouter = Router();

eventsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json(events.map((event) => ({ ...event, data: json.parse(event.data, null) })));
  })
);

// Server-Sent Events stream for the live activity feed.
eventsRouter.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const client = addClient(res);
  res.write(`data: ${JSON.stringify({ type: "system", message: "connected" })}\n\n`);

  req.on("close", () => removeClient(client));
});
