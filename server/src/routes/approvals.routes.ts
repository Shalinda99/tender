import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/async-handler.js";
import { emitEvent } from "../lib/events.js";
import { settlePurchase } from "../services/paypal.js";

export const approvalsRouter = Router();

approvalsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const approvals = await prisma.approval.findMany({
      where: { status: "pending" },
      include: { transaction: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(approvals);
  })
);

const decideSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  decidedBy: z.string().trim().min(1).optional(),
});

approvalsRouter.post(
  "/:id/decide",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { decision, decidedBy } = decideSchema.parse(req.body ?? {});

    // Atomically claim the approval ONLY if it is still pending. This prevents a
    // double-click / race from settling the same transaction (double-charge).
    const claimed = await prisma.approval.updateMany({
      where: { id, status: "pending" },
      data: { status: decision, decidedBy: decidedBy ?? "treasurer" },
    });
    if (claimed.count === 0) {
      return res.status(409).json({ error: "Approval already decided or not found" });
    }

    const approval = await prisma.approval.findUniqueOrThrow({
      where: { id },
      include: {
        transaction: { include: { offer: { include: { sellerAgent: { include: { wallet: true } } } } } },
      },
    });

    if (decision === "approved") {
      // Human approved — the agent resumes and settles via PayPal.
      const recipientEmail = approval.transaction.offer?.sellerAgent.wallet?.paypalRef ?? null;
      const settlement = await settlePurchase({
        amount: approval.transaction.amount,
        description: approval.transaction.itemLabel ?? "Tender approved purchase",
        recipientEmail,
      });
      await prisma.transaction.update({
        where: { id: approval.transactionId },
        data: {
          status: settlement.status === "COMPLETED" ? "completed" : "pending",
          paypalRef: settlement.id,
        },
      });
      await emitEvent({
        type: "payment",
        message: `\u2705 Approved — settled $${approval.transaction.amount} via PayPal (${settlement.mode}), ref ${settlement.id}.`,
        data: { approvalId: id, decision, paypalRef: settlement.id, orderId: settlement.orderId },
      });
    } else {
      await prisma.transaction.update({
        where: { id: approval.transactionId },
        data: { status: "failed" },
      });
      await emitEvent({
        type: "approval",
        message: `\u274C Rejected ${approval.transaction.itemLabel ?? "transaction"} ($${approval.transaction.amount}) — agent stood down.`,
        data: { approvalId: id, decision },
      });
    }

    res.json({ ok: true, approval });
  })
);
