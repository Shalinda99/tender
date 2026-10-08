import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { heartbeat } from "./lib/events.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

// Keep SSE connections alive through proxies/load balancers.
const heartbeatTimer = setInterval(heartbeat, 25_000);

const server = app.listen(env.API_PORT, () => {
  console.log(`Tender API listening on http://localhost:${env.API_PORT} (mode: ${env.TENDER_MODE})`);
});

async function shutdown(signal: string) {
  console.log(`\n${signal} received — shutting down gracefully...`);
  clearInterval(heartbeatTimer);
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
