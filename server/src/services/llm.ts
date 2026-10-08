import { env } from "../config/env.js";

/**
 * Minimal OpenAI-compatible chat client that works with OpenRouter and Groq.
 * Used to drive agent negotiation decisions. Degrades gracefully: callers
 * should fall back to deterministic logic if `isLLMEnabled()` is false or a
 * call throws.
 */

type Provider = "openrouter" | "groq";

function resolveConfig(): { baseURL: string; apiKey: string; model: string } | null {
  const provider = env.LLM_PROVIDER as Provider | "none";

  if (provider === "openrouter" && env.OPENROUTER_API_KEY) {
    return {
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: env.OPENROUTER_API_KEY,
      model: env.LLM_MODEL || "openai/gpt-4o-mini",
    };
  }
  if (provider === "groq" && env.GROQ_API_KEY) {
    return {
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: env.GROQ_API_KEY,
      model: env.LLM_MODEL || "openai/gpt-oss-20b",
    };
  }
  return null;
}

export function isLLMEnabled(): boolean {
  return resolveConfig() !== null;
}

export function llmProviderLabel(): string {
  const cfg = resolveConfig();
  return cfg ? `${env.LLM_PROVIDER}:${cfg.model}` : "deterministic";
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/** Calls the chat API and returns the raw assistant text. Throws on failure. */
export async function chat(messages: ChatMessage[], opts?: { temperature?: number }): Promise<string> {
  const cfg = resolveConfig();
  if (!cfg) throw new Error("LLM not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const res = await fetch(`${cfg.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: cfg.model,
        messages,
        temperature: opts?.temperature ?? 0.7,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`LLM ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("LLM returned empty content");
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

/** Calls the chat API expecting a JSON object response. Throws on parse failure. */
export async function chatJSON<T>(messages: ChatMessage[], opts?: { temperature?: number }): Promise<T> {
  const text = await chat(messages, opts);
  return JSON.parse(text) as T;
}
