export type Agent = {
  id: string;
  name: string;
  type: "buyer" | "seller" | "manager";
  owner: string;
  avatar?: string | null;
  persona: string;
  wallet?: { balanceCached: number; currency: string; paypalRef?: string | null } | null;
  policy?: {
    perTxnCap: number;
    dailyCap: number;
    approvalThreshold: number;
    categoryAllowList: string[];
  } | null;
};

export type Transaction = {
  id: string;
  type: string;
  paypalRef?: string | null;
  amount: number;
  currency: string;
  status: string;
  buyer?: string | null;
  seller?: string | null;
  itemLabel?: string | null;
  createdAt: string;
  offer?: { rounds: Array<{ actor: string; price: number; message: string; at: string }> } | null;
};

export type TenderEvent = {
  id: string;
  type: "negotiation" | "payment" | "approval" | "system";
  agentId?: string | null;
  message: string;
  data?: any;
  createdAt: string;
};

export type Approval = {
  id: string;
  transactionId: string;
  status: string;
  reason?: string | null;
  requestedBy: string;
  transaction: Transaction;
};

// In production the dashboard is served separately from the API, so it targets
// the API's absolute URL via VITE_API_BASE (baked at build time). Locally this
// is unset and the Vite dev proxy forwards "/api" to the server.
const BASE = ((import.meta as any).env?.VITE_API_BASE as string | undefined)?.replace(/\/$/, "") ?? "/api";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

export const api = {
  health: () => get<{ ok: boolean }>("/health"),
  mode: () => get<{ paypal: "live" | "mock" }>("/mode"),
  agents: () => get<Agent[]>("/agents"),
  transactions: () => get<Transaction[]>("/transactions"),
  events: () => get<TenderEvent[]>("/events"),
  approvals: () => get<Approval[]>("/approvals"),
  runShopping: (category?: string) => post("/agents/run/shopping", { category }),
  runFreelancer: () => post("/agents/run/freelancer"),
  decideApproval: (id: string, decision: "approved" | "rejected") =>
    post(`/approvals/${id}/decide`, { decision }),
  streamUrl: `${BASE}/events/stream`,
};
