import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

/** Duck-typed check for Prisma's known request errors (code like "P2025"). */
function isPrismaKnownError(err: unknown): err is { code: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof (err as { code: unknown }).code === "string" &&
    (err as { code: string }).code.startsWith("P")
  );
}

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: "Not found" });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "Validation failed", issues: err.flatten() });
  }

  if (isPrismaKnownError(err)) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Resource not found" });
    }
    return res.status(400).json({ error: "Database request error", code: err.code });
  }

  console.error("[tender-api] Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
};
