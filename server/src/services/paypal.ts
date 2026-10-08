/**
 * PayPal service.
 *
 * Runs in two modes:
 *  - "live": calls the PayPal sandbox REST API (requires client id/secret).
 *  - "mock": returns realistic fake IDs so the whole product works end-to-end
 *            before credentials are configured. Controlled by TENDER_MODE and
 *            the presence of PAYPAL_CLIENT_ID/SECRET.
 */

import { env } from "../config/env.js";

const BASE = env.PAYPAL_BASE_URL;
const CLIENT_ID = env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = env.PAYPAL_CLIENT_SECRET;

export const isLive = () => env.TENDER_MODE === "live" && Boolean(CLIENT_ID && CLIENT_SECRET);

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return data.access_token;
}

function mockId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

export type SettlementResult = {
  id: string; // primary reference shown in the ledger (payout batch or order id)
  status: string;
  mode: "live" | "mock";
  orderId?: string; // real PayPal Orders API id when available
};

/** Creates a PayPal Order (Orders API v2). Returns the order id + status. */
async function createOrder(amount: number, currency: string, description?: string) {
  const token = await getAccessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: currency, value: amount.toFixed(2) },
          description,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`createOrder failed: ${await res.text()}`);
  return (await res.json()) as { id: string; status: string };
}

/**
 * Settles an agent-to-agent purchase.
 *
 * In mock mode this returns a realistic completed order id. In live mode a real
 * PayPal Order is created (Orders API), then funds are actually disbursed to the
 * seller's sandbox account via the Payouts API — a true server-to-server
 * settlement that completes without a browser approval step (which an autonomous
 * agent cannot perform).
 */
export async function settlePurchase(input: {
  amount: number;
  description?: string;
  recipientEmail?: string | null;
  currency?: string;
}): Promise<SettlementResult> {
  const currency = input.currency ?? "USD";

  if (!isLive()) {
    return { id: mockId("ORD"), status: "COMPLETED", mode: "mock" };
  }

  // Exercise the Orders API for a real order reference (non-fatal if it fails).
  let orderId: string | undefined;
  try {
    const order = await createOrder(input.amount, currency, input.description);
    orderId = order.id;
  } catch (err) {
    console.warn("[paypal] createOrder failed (continuing to payout):", (err as Error).message);
  }

  if (input.recipientEmail) {
    const payout = await createPayout({
      recipients: [{ email: input.recipientEmail, amount: input.amount }],
      note: input.description ?? "Tender settlement",
    });
    return { id: payout.batchId, status: "COMPLETED", mode: "live", orderId };
  }

  // No payout recipient available — return the created order (pending approval).
  return { id: orderId ?? mockId("ORD"), status: "CREATED", mode: "live", orderId };
}

export async function createPayout(input: {
  recipients: Array<{ email: string; amount: number }>;
  currency?: string;
  note?: string;
}): Promise<{ batchId: string; mode: "live" | "mock" }> {
  const currency = input.currency ?? "USD";
  if (!isLive()) return { batchId: mockId("PAYOUT"), mode: "mock" };

  const token = await getAccessToken();
  const res = await fetch(`${BASE}/v1/payments/payouts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender_batch_header: {
        sender_batch_id: mockId("BATCH"),
        email_subject: input.note ?? "Tender payout",
      },
      items: input.recipients.map((r) => ({
        recipient_type: "EMAIL",
        amount: { value: r.amount.toFixed(2), currency },
        receiver: r.email,
      })),
    }),
  });
  if (!res.ok) throw new Error(`createPayout failed: ${await res.text()}`);
  const data = (await res.json()) as { batch_header: { payout_batch_id: string } };
  return { batchId: data.batch_header.payout_batch_id, mode: "live" };
}
