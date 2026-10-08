import { PrismaClient } from "@prisma/client";
import "../config/env.js"; // ensures DATABASE_URL is resolved before client init

export const prisma = new PrismaClient();

/** Helpers for the JSON-as-string fields (portable across SQLite/Postgres). */
export const json = {
  parse<T>(value: string | null | undefined, fallback: T): T {
    if (!value) return fallback;
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  },
  stringify(value: unknown): string {
    return JSON.stringify(value ?? null);
  },
};
