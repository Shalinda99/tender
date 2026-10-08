import type { RequestHandler } from "express";

/**
 * Wraps an async route handler so rejected promises are forwarded to Express'
 * error-handling middleware instead of hanging the request.
 */
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
