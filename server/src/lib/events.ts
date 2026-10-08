import type { Response } from "express";
import { prisma, json } from "./prisma.js";

export type EventType = "negotiation" | "payment" | "approval" | "system";

type Client = { id: number; res: Response };

const clients = new Set<Client>();
let nextId = 1;

export function addClient(res: Response): Client {
  const client = { id: nextId++, res };
  clients.add(client);
  return client;
}

export function removeClient(client: Client) {
  clients.delete(client);
}

function send(client: Client, payload: unknown) {
  client.res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

/**
 * Broadcast an event to all connected SSE clients AND persist it so the
 * activity feed / grid survive reloads. This is the heartbeat of the demo.
 */
export async function emitEvent(input: {
  type: EventType;
  message: string;
  agentId?: string | null;
  data?: unknown;
}) {
  const event = await prisma.event.create({
    data: {
      type: input.type,
      message: input.message,
      agentId: input.agentId ?? null,
      data: input.data ? json.stringify(input.data) : null,
    },
  });

  const payload = { ...event, data: input.data ?? null };
  for (const client of clients) send(client, payload);
  return event;
}

export function heartbeat() {
  for (const client of clients) client.res.write(`: ping\n\n`);
}
