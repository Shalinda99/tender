# Tender

**Agentic commerce, settled instantly with PayPal.**

Tender gives every person and business an AI agent with its own PayPal-backed
wallet and spending guardrails. Agents discover needs, negotiate offers with
other agents, and settle payments automatically — all supervised from a
real-time command center built on AG Grid.

> _Legal **tender** (money) + to **tender** an offer (what agents do when they
> negotiate and buy). One word, the whole product._

**Live demo:** https://tender-web-686i.onrender.com ·
**API:** https://tender-api-dtv0.onrender.com/health

> The hosted demo runs on Render's free tier, so the first request after a period
> of inactivity can take about a minute while the API wakes up.

---

## Contents

[Problem](#the-problem) · [Solution](#our-solution) · [Features](#features) ·
[Business value](#business-value) · [Tech stack](#tech-stack) ·
[Run locally](#run-it-locally) · [Configuration](#configuration) ·
[Deploy](#deploy-to-render) · [License](#license)

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

## Features

- **Autonomous shopping** — a buyer agent contacts competing sellers, negotiates
  with each, and settles with the cheapest offer.
- **Big-ticket negotiation** — an acquisitions agent haggles with two land
  brokers or two car dealers over several rounds, using category-specific
  arguments (title, zoning and frontage for land; mileage and warranty for cars).
- **Policy guardrails** — per-transaction cap, daily cap, category allow-list and
  an approval threshold on every agent.
- **Human approval** — purchases above the threshold wait in an approvals queue
  and no money moves until a person approves.
- **Revenue splitting** — a manager agent is paid, then pays its subcontractors in
  one PayPal Payouts batch.
- **Real-time dashboard** — 9 seeded agents, a live ledger (AG Grid), a streaming
  activity feed over Server-Sent Events, and spend analytics. Each deal opens into
  its full negotiation transcript.
- **Mock or live PayPal** — one switch (`TENDER_MODE`) toggles between fake IDs and
  the real PayPal sandbox.

## Business value

- **For small businesses & freelancers** — automates cashflow: agents invoice
  clients and split revenue to subcontractors the moment a client pays.
- **For households & buyers** — an agent shops within a set budget, negotiates
  the best price, and only interrupts a human for larger purchases.
- **For marketplaces** — settle sellers automatically through PayPal Payouts as
  soon as a deal closes.
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

## Configuration

All settings live in `server/.env` (copy from `server/.env.example`).

| Variable | Purpose | Default |
| --- | --- | --- |
| `TENDER_MODE` | `mock` (no PayPal calls) or `live` (PayPal sandbox) | `mock` |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | PayPal sandbox app credentials | empty |
| `PAYPAL_BASE_URL` | PayPal API base URL | `https://api-m.sandbox.paypal.com` |
| `LLM_PROVIDER` | `groq`, `openrouter` or `none` (deterministic negotiation) | `groq` in the example file |
| `GROQ_API_KEY` / `OPENROUTER_API_KEY` | LLM provider key | empty |
| `LLM_MODEL` | Model name for the chosen provider | `openai/gpt-oss-20b` (Groq) |
| `DATABASE_URL` | Prisma database URL | `file:./dev.db` (SQLite) |
| `API_PORT` | API port | `4000` |
| `WEB_ORIGIN` | Allowed CORS origin for the dashboard | `http://localhost:5173` |

The client reads `VITE_API_BASE` at build time to find the API.

## Deploy to Render

`render.yaml` is a Render Blueprint that creates two free services:

- **`tender-api`** — Node + Express API (SQLite, re-seeded on each deploy)
- **`tender-web`** — static React/Vite dashboard

1. Push the repo to GitHub.
2. In Render choose **New + → Blueprint**, select the repository and click **Apply**.
3. When `tender-api` is **Live**, check `https://<your-api>.onrender.com/health`.
4. On `tender-web`, set `VITE_API_BASE` to the API URL (no trailing slash) and
   redeploy so it is compiled into the build.
5. Optional: set `WEB_ORIGIN` on `tender-api` to your dashboard URL to restrict CORS.
6. Optional: to use real PayPal and an LLM, set `TENDER_MODE=live`, the PayPal
   credentials, `LLM_PROVIDER=groq` and `GROQ_API_KEY` on `tender-api`.

**Free-tier notes:** services sleep after about 15 minutes idle and take around
50 seconds to wake. SQLite data resets on each restart or deploy.

**Troubleshooting**

| Symptom | Fix |
| --- | --- |
| Dashboard shows no data or network errors | `VITE_API_BASE` is missing or wrong; set it and redeploy `tender-web`. |
| CORS errors in the browser console | Set `WEB_ORIGIN` to `*` or your exact dashboard URL, then redeploy the API. |
| `/health` returns 404 | The API is still building, or you opened the web URL instead of the API URL. |
| Live payouts return `DENIED (insufficient funds)` | Add a balance to the sandbox business account under **Testing Tools → Sandbox Accounts**. |

## License

MIT — see [`LICENSE`](LICENSE).
