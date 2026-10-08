import { Router } from "express";
import { prisma, json } from "../lib/prisma.js";
import { asyncHandler } from "../lib/async-handler.js";

export const transactionsRouter = Router();

transactionsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const transactions = await prisma.transaction.findMany({
      include: { offer: true, approval: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(
      transactions.map((txn) => ({
        ...txn,
        offer: txn.offer ? { ...txn.offer, rounds: json.parse(txn.offer.rounds, []) } : null,
      }))
    );
  })
);
