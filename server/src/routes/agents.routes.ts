import { Router } from "express";
import { z } from "zod";
import { prisma, json } from "../lib/prisma.js";
import { asyncHandler } from "../lib/async-handler.js";
import { emitEvent } from "../lib/events.js";
import { runShoppingScenario, runFreelancerScenario } from "../agents/orchestrator.js";

export const agentsRouter = Router();

agentsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const agents = await prisma.agent.findMany({
      include: { wallet: true, policy: true },
      orderBy: { createdAt: "asc" },
    });
    res.json(
      agents.map((agent) => ({
        ...agent,
        policy: agent.policy
          ? { ...agent.policy, categoryAllowList: json.parse<string[]>(agent.policy.categoryAllowList, []) }
          : null,
      }))
    );
  })
);

const shoppingSchema = z.object({ category: z.string().trim().min(1).optional() });

agentsRouter.post(
  "/run/shopping",
  asyncHandler(async (req, res) => {
    const { category } = shoppingSchema.parse(req.body ?? {});
    // Fire-and-forget so the SSE stream delivers the play-by-play.
    runShoppingScenario({ category }).catch((err) =>
      emitEvent({ type: "system", message: `Shopping scenario error: ${err.message}` })
    );
    res.status(202).json({ ok: true, started: "shopping" });
  })
);

agentsRouter.post(
  "/run/freelancer",
  asyncHandler(async (_req, res) => {
    runFreelancerScenario().catch((err) =>
      emitEvent({ type: "system", message: `Freelancer scenario error: ${err.message}` })
    );
    res.status(202).json({ ok: true, started: "freelancer" });
  })
);
