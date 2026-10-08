import { prisma, json } from "../lib/prisma.js";
import { emitEvent } from "../lib/events.js";
import { negotiate, llmNegotiate } from "./negotiate.js";
import { settlePurchase, createPayout } from "../services/paypal.js";
import { isLLMEnabled, llmProviderLabel } from "../services/llm.js";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * The buyer "Butler" agent fulfills a need: it compares offers from competing
 * merchant agents, negotiates with each, picks the best deal, runs it through
 * the policy/guardrail engine, and settles via PayPal.
 */
export async function runShoppingScenario(opts?: { category?: string; pace?: number }) {
  const pace = opts?.pace ?? 600;
  const category = opts?.category ?? "groceries";

  const butler = await prisma.agent.findFirst({
    where: { type: "buyer" },
    include: { policy: true },
  });
  if (!butler || !butler.policy) throw new Error("No buyer agent seeded.");

  await emitEvent({
    type: "system",
    agentId: butler.id,
    message: `${butler.name} detected a ${category} restock need (budget cap $${butler.policy.perTxnCap}/item).`,
  });
  await sleep(pace);

  // Gather competing offers for one product title across sellers.
  const products = await prisma.product.findMany({
    where: { category },
    include: { sellerAgent: { include: { wallet: true } } },
  });
  if (products.length === 0) throw new Error(`No products in category ${category}.`);

  type ProductWithSeller = (typeof products)[number];
  const titles = [...new Set(products.map((p: ProductWithSeller) => p.title))];
  const targetTitle = titles[Math.floor(Math.random() * titles.length)];
  const competing = products.filter((p: ProductWithSeller) => p.title === targetTitle);

  await emitEvent({
    type: "system",
    agentId: butler.id,
    message: `Sourcing "${targetTitle}" from ${competing.length} merchant agents...`,
  });
  await sleep(pace);

  const buyerCeiling = butler.policy.perTxnCap;
  const useLLM = isLLMEnabled();
  if (useLLM) {
    await emitEvent({
      type: "system",
      agentId: butler.id,
      message: `Agents negotiating with AI (${llmProviderLabel()}).`,
    });
  }

  let best: {
    sellerId: string;
    sellerName: string;
    sellerEmail: string | null;
    price: number;
    productId: string;
  } | null = null;
  let bestRounds: any[] = [];

  for (const product of competing) {
    const floor = json.parse<{ floor?: number }>(product.metadata ?? null, {}).floor ?? product.price * 0.7;
    const negotiationParams = {
      listPrice: product.price,
      buyerCeiling,
      sellerFloor: floor,
      item: product.title,
      buyerPersona: butler.persona,
      sellerPersona: product.sellerAgent.persona,
    };
    const result = useLLM ? await llmNegotiate(negotiationParams) : negotiate(negotiationParams);

    for (const round of result.rounds) {
      const who = round.actor === "buyer" ? butler.name : product.sellerAgent.name;
      await emitEvent({
        type: "negotiation",
        agentId: round.actor === "buyer" ? butler.id : product.sellerAgent.id,
        message: `${who}: ${round.message}`,
        data: { price: round.price, seller: product.sellerAgent.name },
      });
      await sleep(pace / 2);
    }

    if (result.agreed && result.finalPrice != null) {
      if (!best || result.finalPrice < best.price) {
        best = {
          sellerId: product.sellerAgent.id,
          sellerName: product.sellerAgent.name,
          sellerEmail: product.sellerAgent.wallet?.paypalRef ?? null,
          price: result.finalPrice,
          productId: product.id,
        };
        bestRounds = result.rounds;
      }
    }
  }

  if (!best) {
    await emitEvent({
      type: "system",
      agentId: butler.id,
      message: `No deal reached within budget. ${butler.name} will retry later.`,
    });
    return { outcome: "no_deal" as const };
  }

  await emitEvent({
    type: "system",
    agentId: butler.id,
    message: `Best offer: ${best.sellerName} at $${best.price.toFixed(2)}. Checking spend policy...`,
  });
  await sleep(pace);

  // Record the winning offer.
  const offer = await prisma.offer.create({
    data: {
      buyerAgentId: butler.id,
      sellerAgentId: best.sellerId,
      productId: best.productId,
      status: "accepted",
      rounds: json.stringify(bestRounds),
    },
  });

  // ── Policy / guardrail check ──────────────────────────────
  const needsApproval = best.price >= butler.policy.approvalThreshold;

  if (needsApproval) {
    const txn = await prisma.transaction.create({
      data: {
        offerId: offer.id,
        type: "order",
        amount: best.price,
        status: "awaiting_approval",
        buyer: butler.name,
        seller: best.sellerName,
        itemLabel: targetTitle,
      },
    });
    await prisma.approval.create({
      data: {
        transactionId: txn.id,
        requestedBy: butler.name,
        reason: `$${best.price.toFixed(2)} >= approval threshold $${butler.policy.approvalThreshold}`,
      },
    });
    await emitEvent({
      type: "approval",
      agentId: butler.id,
      message: `\u23F8 Spend of $${best.price.toFixed(2)} exceeds cap — waiting for human approval.`,
      data: { transactionId: txn.id },
    });
    return { outcome: "awaiting_approval" as const, transactionId: txn.id };
  }

  // ── Settle via PayPal ─────────────────────────────────────
  const settlement = await settlePurchase({
    amount: best.price,
    description: `${targetTitle} from ${best.sellerName}`,
    recipientEmail: best.sellerEmail,
  });

  const txn = await prisma.transaction.create({
    data: {
      offerId: offer.id,
      type: "order",
      paypalRef: settlement.id,
      amount: best.price,
      status: settlement.status === "COMPLETED" ? "completed" : "pending",
      buyer: butler.name,
      seller: best.sellerName,
      itemLabel: targetTitle,
    },
  });

  await emitEvent({
    type: "payment",
    agentId: butler.id,
    message: `\u2705 Paid ${best.sellerName} $${best.price.toFixed(2)} via PayPal (${settlement.mode}) — ref ${settlement.id}.`,
    data: { transactionId: txn.id, paypalRef: settlement.id, orderId: settlement.orderId },
  });

  return { outcome: "completed" as const, transactionId: txn.id, paypalRef: settlement.id };
}

/**
 * The freelancer "Manager" agent invoices a client, then auto-splits a payout
 * to subcontractors once paid. Demonstrates Payouts + the Impact scenario.
 */
export async function runFreelancerScenario(opts?: { pace?: number }) {
  const pace = opts?.pace ?? 600;
  const manager = await prisma.agent.findFirst({ where: { type: "manager" } });
  if (!manager) throw new Error("No manager agent seeded.");

  const invoiceAmount = 1200;
  await emitEvent({
    type: "system",
    agentId: manager.id,
    message: `${manager.name} issued a $${invoiceAmount} invoice to Acme Corp.`,
  });
  await sleep(pace);

  await emitEvent({
    type: "payment",
    agentId: manager.id,
    message: `Acme Corp paid the invoice. Splitting payouts to subcontractors...`,
  });
  await sleep(pace);

  const payout = await createPayout({
    recipients: [
      { email: "sb-ycwwq53248932@personal.example.com", amount: 700 },
      { email: "sb-ycwwq53248932@personal.example.com", amount: 300 },
    ],
    note: "Project revenue split",
  });

  const txn = await prisma.transaction.create({
    data: {
      type: "payout",
      paypalRef: payout.batchId,
      amount: 1000,
      status: "completed",
      buyer: manager.name,
      seller: "Subcontractors (2)",
      itemLabel: "Revenue split payout",
    },
  });

  await emitEvent({
    type: "payment",
    agentId: manager.id,
    message: `\u2705 Paid out $1000 to 2 subcontractors via PayPal (${payout.mode}) — batch ${payout.batchId}.`,
    data: { transactionId: txn.id },
  });

  return { outcome: "completed" as const, transactionId: txn.id };
}
