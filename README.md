# Tender

**Agentic commerce, settled instantly with PayPal.**

Tender gives every person and business an AI agent with its own PayPal-backed
wallet and spending guardrails. Agents discover needs, negotiate offers with
other agents, and settle payments automatically — all supervised from a
real-time command center built on AG Grid.

> _Legal **tender** (money) + to **tender** an offer (what agents do when they
> negotiate and buy). One word, the whole product._

---

## The problem

AI agents are increasingly able to decide _what_ to buy — but they have no safe
way to actually _pay_ for it. Two gaps block real "agentic commerce":

- **No trusted settlement rail.** Letting an autonomous agent touch a raw payment
  API or a shared card is risky and hard to audit.
- **No guardrails or human oversight.** Without spend caps, approvals, and a full
  audit trail, no business can let software move money on its behalf.

## Our solution

Tender gives every person or business an **AI agent with its own
PayPal-backed wallet** and a policy that defines what it is allowed to do.
Agents then:

- **Discover** needs and products in a shared marketplace.
- **Negotiate** price agent-to-agent (an LLM haggles in character, while
  code-level guardrails enforce each side's budget floor/ceiling).
- **Settle** the agreed amount automatically through **PayPal**.
- **Stay under control** — any spend above a configurable threshold is paused for
  **human approval**, every action is logged, and spend caps are enforced per
  transaction and per day.

Everything is supervised from a **real-time command center** built on AG Grid:
a live ledger of transactions, a streaming activity feed, an approvals queue,
and spend analytics.

## Business value

- **For small businesses & freelancers** — automates cashflow: agents invoice
  clients and split revenue to subcontractors the moment a client pays.
- **For households & buyers** — an agent shops within a set budget, negotiates
  the best price, and only interrupts a human for larger purchases.
- **For PayPal** — positions PayPal as the **settlement backbone of the emerging
  agent economy**, where software, not just people, initiates payments.
- **Trust by design** — guardrails, human-in-the-loop approvals, and an audit
  trail make autonomous spend something a business can actually adopt.

## Project structure

```
tender/
├─ server/   # Node + Express + TypeScript API (Prisma, PayPal, AI agents, SSE)
└─ client/   # React + Vite dashboard (Tailwind, AG Grid, live activity feed)
```

## Tech stack

- **Frontend:** React, Vite, TypeScript, TailwindCSS, AG Grid, Recharts, Lucide
- **Backend:** Node.js, Express, TypeScript, Prisma, SQLite (local) / PostgreSQL
- **Payments:** PayPal sandbox — Orders & Payouts APIs (live/mock modes)
- **AI:** OpenAI-compatible LLM (Groq / OpenRouter) drives agent negotiation

## Run it locally

**Prerequisites:** Node.js ≥ 20 and npm.

### 1. Install dependencies (from the repo root)

```bash
npm install
```

### 2. Set up environment variables

```bash
cp server/.env.example server/.env
```

The defaults run Tender in **mock mode** — the whole app works end-to-end with
**no API keys**, generating realistic PayPal order/payout IDs. To use the real
PayPal sandbox and a real LLM, fill in `server/.env`:

```ini
# PayPal sandbox (https://developer.paypal.com → Apps & Credentials)
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret

# AI (Groq is free & fast — https://console.groq.com)
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_key
LLM_MODEL=openai/gpt-oss-20b

# Flip to "live" to hit the real PayPal sandbox APIs
TENDER_MODE=live
```

### 3. Create and seed the local database

```bash
npm run db:push --workspace @tender/server   # create the SQLite schema
npm run db:seed --workspace @tender/server   # load demo agents, products, policies
```

### 4. Start both apps (one command, from the repo root)

```bash
npm run dev
```

- API → http://localhost:4000
- Dashboard → http://localhost:5173

> Prefer separate terminals? Run `npm run dev:server` and `npm run dev:client`.

Once both apps are running, use the dashboard controls to trigger the shopping,
big-purchase (human approval), and freelancer settlement flows. In **mock mode**
this works with no API keys; in **live mode** PayPal payouts are sent from the
sandbox business account that owns your app, so give it a balance under
**Testing Tools → Sandbox Accounts** or payouts return `DENIED (insufficient
funds)`.

## License

MIT — see [`LICENSE`](LICENSE). (Required by the hackathon: public + open source.)
