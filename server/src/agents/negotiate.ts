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
  category?: string;
  buyerName?: string;
  sellerName?: string;
  buyerPersona: string;
  sellerPersona: string;
  maxRounds?: number;
}): Promise<NegotiationResult> {
  const { listPrice, buyerCeiling, sellerFloor, item, category, buyerPersona, sellerPersona } = params;

  if (!isLLMEnabled() || buyerCeiling < sellerFloor) {
    return negotiate(params);
  }

  const system =
    "You simulate a REALISTIC, human-sounding price negotiation between two autonomous commerce agents. " +
    "They should haggle like seasoned human dealmakers: the seller defends the price with concrete, " +
    "category-specific justifications (condition, comparables, demand, title/zoning, mileage/warranty), " +
    "and the buyer pushes back with reasons (budget, comparable quotes, extra costs, paying now) and " +
    "concedes gradually. Be persuasive and in-character, not robotic. " +
    "Return STRICT JSON only, matching: " +
    '{"agreed": boolean, "finalPrice": number|null, ' +
    '"rounds": [{"actor": "buyer"|"seller", "price": number, "message": string}]}. ' +
    "Start with the seller stating the list price, then alternate. Use 4-6 rounds. " +
    "Each message under 160 characters, natural and specific to the item.";

  const user = JSON.stringify({
    item,
    category: category ?? "general",
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

// ── Human-like dialogue flavor ──────────────────────────────
// Category-specific justifications so the deterministic engine (used whenever
// no LLM key is configured) still reads like two people haggling, not a script.
type Flavor = { sellerPitch: string[]; buyerPush: string[] };

const FLAVORS: Record<string, Flavor> = {
  "real-estate": {
    sellerPitch: [
      "the title's clean and it's zoned ready-to-build",
      "comparable lots nearby closed for more",
      "the survey and permits are already done",
      "frontage like this rarely comes up",
    ],
    buyerPush: [
      "my financing is pre-approved, not unlimited",
      "I've seen comparable parcels list for less",
      "closing costs still land on top of this",
      "the market's cooled a little this quarter",
    ],
  },
  automotive: {
    sellerPitch: [
      "it has full service history and warranty",
      "the mileage is low for the year",
      "this trim is in high demand right now",
      "it's been meticulously maintained",
    ],
    buyerPush: [
      "I can find a similar model cheaper elsewhere",
      "I'm paying cash and can close today",
      "registration and tax still come on top",
      "there's some wear I'd have to sort out",
    ],
  },
  default: {
    sellerPitch: [
      "this is quality stock",
      "my margins here are already thin",
      "demand has been strong on this",
      "I can't go much lower and stay viable",
    ],
    buyerPush: [
      "I'm working to a tight budget",
      "I'm buying in volume",
      "I've had lower quotes already",
      "I need the numbers to actually work",
    ],
  },
};

function fmt(n: number): string {
  return n >= 1000 ? `$${Math.round(n).toLocaleString("en-US")}` : `$${n.toFixed(2)}`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function negotiate(params: {
  listPrice: number;
  buyerCeiling: number;
  sellerFloor: number;
  item?: string;
  category?: string;
  buyerName?: string;
  sellerName?: string;
  maxRounds?: number;
}): NegotiationResult {
  const { listPrice, buyerCeiling, sellerFloor } = params;
  const item = params.item ?? "the item";
  const flavor = FLAVORS[params.category ?? ""] ?? FLAVORS.default;
  const maxRounds = params.maxRounds ?? 5;
  const rounds: Round[] = [];

  // Buyer anchors its opening bid to the item's list price (not its budget
  // cap), but never bids above its hard ceiling.
  let buyerBid = Math.min(buyerCeiling, Math.max(sellerFloor, Math.round(listPrice * 0.7)));
  let sellerAsk = listPrice;

  rounds.push({
    actor: "seller",
    price: sellerAsk,
    message: `${item} is listed at ${fmt(sellerAsk)}. ${cap(pick(flavor.sellerPitch))}.`,
    at: now(),
  });

  for (let i = 0; i < maxRounds; i++) {
    const firstBid = i === 0;
    rounds.push({
      actor: "buyer",
      price: buyerBid,
      message:
        buyerBid >= sellerAsk
          ? `That works for me — ${fmt(buyerBid)} and we have a deal.`
          : firstBid
          ? `I'm interested, but ${pick(flavor.buyerPush)}. I can do ${fmt(buyerBid)}.`
          : `${cap(pick(flavor.buyerPush))} — I'll come up to ${fmt(buyerBid)}.`,
      at: now(),
    });
    if (buyerBid >= sellerAsk) {
      return { agreed: true, finalPrice: sellerAsk, rounds };
    }

    // Seller concedes toward the midpoint but never below floor.
    const midpoint = (buyerBid + sellerAsk) / 2;
    const prevAsk = sellerAsk;
    sellerAsk = Math.max(sellerFloor, Math.round(midpoint));
    const atFloor = sellerAsk <= sellerFloor + 1;

    rounds.push({
      actor: "seller",
      price: sellerAsk,
      message: atFloor
        ? `${fmt(sellerAsk)} is my best — that's as low as I can go on ${item}.`
        : prevAsk - sellerAsk > 0
        ? `${cap(pick(flavor.sellerPitch))}, but for a serious buyer I'll meet you at ${fmt(sellerAsk)}.`
        : `I can come down to ${fmt(sellerAsk)}.`,
      at: now(),
    });

    if (sellerAsk <= buyerBid) {
      rounds.push({
        actor: "buyer",
        price: sellerAsk,
        message: `Fair enough — ${fmt(sellerAsk)} it is. Let's close.`,
        at: now(),
      });
      return { agreed: true, finalPrice: sellerAsk, rounds };
    }
    if (sellerAsk <= buyerCeiling) {
      // Buyer accepts seller's reachable offer.
      rounds.push({
        actor: "buyer",
        price: sellerAsk,
        message: `Agreed — ${fmt(sellerAsk)}. Pleasure doing business.`,
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
    message: `We're too far apart on ${item} — I'll keep looking. Thanks anyway.`,
    at: now(),
  });
  return { agreed: false, finalPrice: null, rounds };
}
