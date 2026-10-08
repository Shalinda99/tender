# Tender

**Agentic commerce, settled instantly with PayPal.**

Tender gives every person and business an AI agent with its own PayPal-backed
wallet and spending guardrails. Agents discover needs, negotiate offers with
other agents, and settle payments automatically — all supervised from a
real-time command center built on AG Grid.

> _Legal **tender** (money) + to **tender** an offer (what agents do when they
> negotiate and buy). One word, the whole product._

---

## Why this wins

Tender is engineered to compete for the maximum number of prizes in the
**Build What's Next with PayPal and AI** hackathon:

| Prize | How Tender targets it |
| --- | --- |
| Best Use of Agentic Commerce ($5k) | Literal agent-to-agent negotiation + autonomous settlement |
| Best Use of PayPal + AI ($5k) | PayPal is the settlement backbone; AI drives every action |
| Best Use of AG Grid ($5k / $2k / $1k) | Real-time financial command center built on AG Grid |
| Most Impactful ($5k) | Automates cashflow for freelancers & small businesses |
| Most Creative ($5k) | A marketplace where AI agents transact with each other |
| Best Demo Delivery ($5k) | Watch money move between autonomous agents live |
| Best Use of Render | Deployed end-to-end on Render |
| Overall 1st–3rd ($25k) | Ambitious, polished, production-ready execution |

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

### 5. Try it

Open the dashboard and click **Run Shopping Agent**, **Run Big Purchase**
(triggers a human approval), or **Run Freelancer Agent** to watch AI agents
negotiate and settle via PayPal, live in the AG Grid ledger.

> **Live payouts need a funded sandbox account.** PayPal payouts are sent from the
> sandbox business account that owns your app; give it a balance under
> **Testing Tools → Sandbox Accounts**, or payouts return `DENIED (insufficient
> funds)`. Mock mode has no such requirement.

## The 60-second pitch

Today, humans click "buy." Tomorrow, agents will. Tender is the infrastructure
for that world: autonomous AI agents that earn, spend, and settle money safely
on your behalf — with PayPal handling every transaction and humans staying in
control through approvals, spend caps, and a full audit trail.

## License

MIT — see [`LICENSE`](LICENSE). (Required by the hackathon: public + open source.)
