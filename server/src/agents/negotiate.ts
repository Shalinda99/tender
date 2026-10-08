/**
 * Agent-to-agent negotiation engine.
 *
 * In mock mode this is a deterministic haggling simulation driven by each
 * agent's hidden ceiling (buyer budget) and floor (seller minimum). When an
 * LLM key is configured, `llmNegotiate` lets the model drive the haggle while
 * guardrails (floor/ceiling) are enforced in code.
 */

import { chatJSON, isLLMEnabled } from "../services/llm.js";

export type Round = {
  actor: "buyer" | "seller";
  price: number;
  message: string;
  at: string;
};

export type NegotiationResult = {
  agreed: boolean;
  finalPrice: number | null;
  rounds: Round[];
  engine?: "deterministic" | "llm";
};

function now() {
  return new Date().toISOString();
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * LLM-driven negotiation. The model plays out a short buyer/seller haggle in
 * character and proposes a final price; we enforce the guardrails (floor/ceiling)
 * by clamping and validating. Falls back to the deterministic engine on any
 * failure, so the demo is always reliable.
 */
export async function llmNegotiate(params: {
  listPrice: number;
  buyerCeiling: number;
  sellerFloor: number;
  item: string;
  buyerPersona: string;
  sellerPersona: string;
  maxRounds?: number;
}): Promise<NegotiationResult> {
  const { listPrice, buyerCeiling, sellerFloor, item, buyerPersona, sellerPersona } = params;

  if (!isLLMEnabled() || buyerCeiling < sellerFloor) {
    return negotiate(params);
  }

  const system =
    "You simulate a realistic price negotiation between two autonomous commerce agents. " +
    "Return STRICT JSON only, matching: " +
    '{"agreed": boolean, "finalPrice": number|null, ' +
    '"rounds": [{"actor": "buyer"|"seller", "price": number, "message": string}]}. ' +
    "Start with the seller stating the list price, then alternate. 3-6 rounds. " +
    "Keep each message under 140 characters and in character.";

  const user = JSON.stringify({
    item,
    listPrice,
    buyer: { persona: buyerPersona, maxBudget: buyerCeiling },
    seller: { persona: sellerPersona, minimumAcceptable: sellerFloor },
    rule: "Agree only on a price between the seller minimum and buyer max budget. If none exists, no deal.",
  });

  try {
    const out = await chatJSON<NegotiationResult>([
      { role: "system", content: system },
      { role: "user", content: user },
    ]);

    const rounds: Round[] = Array.isArray(out.rounds)
      ? out.rounds
          .filter((r) => r && (r.actor === "buyer" || r.actor === "seller") && typeof r.message === "string")
          .map((r) => ({
            actor: r.actor,
            price: clamp(Number(r.price) || listPrice, sellerFloor, listPrice),
            message: String(r.message).slice(0, 200),
            at: now(),
          }))
      : [];

    if (rounds.length === 0) return negotiate(params);

    // Enforce guardrails on the outcome regardless of what the model claimed.
    let agreed = Boolean(out.agreed) && typeof out.finalPrice === "number";
    let finalPrice = agreed ? clamp(Number(out.finalPrice), sellerFloor, buyerCeiling) : null;
    if (finalPrice !== null && finalPrice > buyerCeiling) {
      agreed = false;
      finalPrice = null;
    }

    return { agreed, finalPrice, rounds, engine: "llm" };
  } catch (err) {
    console.warn("[negotiate] LLM failed, using deterministic engine:", (err as Error).message);
    return negotiate(params);
  }
}

export function negotiate(params: {
  listPrice: number;
  buyerCeiling: number;
  sellerFloor: number;
  maxRounds?: number;
}): NegotiationResult {
  const { listPrice, buyerCeiling, sellerFloor } = params;
  const maxRounds = params.maxRounds ?? 4;
  const rounds: Round[] = [];

  // Buyer anchors its opening bid to the item's list price (not its budget
  // cap), but never bids above its hard ceiling.
  let buyerBid = Math.min(buyerCeiling, Math.max(sellerFloor, Math.round(listPrice * 0.7)));
  let sellerAsk = listPrice;

  rounds.push({
    actor: "seller",
    price: sellerAsk,
    message: `List price is $${sellerAsk.toFixed(2)}.`,
    at: now(),
  });

  for (let i = 0; i < maxRounds; i++) {
    rounds.push({
      actor: "buyer",
      price: buyerBid,
      message:
        buyerBid >= sellerAsk
          ? `Deal — $${buyerBid.toFixed(2)} works.`
          : `I can do $${buyerBid.toFixed(2)}.`,
      at: now(),
    });
    if (buyerBid >= sellerAsk) {
      return { agreed: true, finalPrice: sellerAsk, rounds };
    }

    // Seller concedes toward the midpoint but never below floor.
    const midpoint = (buyerBid + sellerAsk) / 2;
    sellerAsk = Math.max(sellerFloor, Math.round(midpoint));

    rounds.push({
      actor: "seller",
      price: sellerAsk,
      message:
        sellerAsk <= buyerCeiling
          ? `I can meet you at $${sellerAsk.toFixed(2)}.`
          : `Best I can do is $${sellerAsk.toFixed(2)}.`,
      at: now(),
    });

    if (sellerAsk <= buyerBid) {
      return { agreed: true, finalPrice: sellerAsk, rounds };
    }
    if (sellerAsk <= buyerCeiling) {
      // Buyer accepts seller's reachable offer.
      rounds.push({
        actor: "buyer",
        price: sellerAsk,
        message: `Agreed — $${sellerAsk.toFixed(2)}.`,
        at: now(),
      });
      return { agreed: true, finalPrice: sellerAsk, rounds };
    }

    // Buyer nudges up toward ceiling.
    buyerBid = Math.min(buyerCeiling, Math.round((buyerBid + sellerAsk) / 2));
  }

  rounds.push({
    actor: "buyer",
    price: buyerBid,
    message: `We're too far apart — I'll walk away.`,
    at: now(),
  });
  return { agreed: false, finalPrice: null, rounds };
}
