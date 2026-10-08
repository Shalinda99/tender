import "dotenv/config";
import { z } from "zod";

/**
 * Centralized, validated runtime configuration.
 * Importing this module first guarantees the rest of the app sees a complete,
 * type-safe config (and a sensible local SQLite default for DATABASE_URL).
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1).default("file:./dev.db"),
  API_PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.string().default("http://localhost:5173"),

  // PayPal (sandbox). Empty values are allowed — the app falls back to mock mode.
  PAYPAL_CLIENT_ID: z.string().default(""),
  PAYPAL_CLIENT_SECRET: z.string().default(""),
  PAYPAL_WEBHOOK_ID: z.string().default(""),
  PAYPAL_BASE_URL: z.string().url().default("https://api-m.sandbox.paypal.com"),

  // LLM (OpenAI-compatible: OpenRouter or Groq). All optional — the agent
  // falls back to a deterministic negotiation engine when no key is present.
  LLM_PROVIDER: z.enum(["openrouter", "groq", "none"]).default("none"),
  OPENROUTER_API_KEY: z.string().default(""),
  GROQ_API_KEY: z.string().default(""),
  LLM_MODEL: z.string().default(""),

  TENDER_MODE: z.enum(["mock", "live"]).default("mock"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "\u274C Invalid environment configuration:",
    JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)
  );
  process.exit(1);
}

export const env = parsed.data;

// Ensure Prisma (which reads process.env directly) sees the resolved default.
process.env.DATABASE_URL = env.DATABASE_URL;

export const corsOrigins = env.WEB_ORIGIN.split(",").map((origin) => origin.trim());
