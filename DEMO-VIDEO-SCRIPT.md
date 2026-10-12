# Tender — Demo Video Script & Production Guide

A ready-to-record script for a **3–4 minute** submission video. It covers every
feature, the business value, how Tender plugs into real-world e-commerce, the
benefits, and how it satisfies the PayPal hackathon requirements.

- **Live dashboard:** https://tender-web-686i.onrender.com
- **Live API:** https://tender-api-dtv0.onrender.com
- **Repo:** https://github.com/Shalinda99/tender

> **Record in mock mode** (`TENDER_MODE=mock`) so big-ticket land/car payments
> complete instantly on camera. Mention live PayPal sandbox verbally (Section 7).

---

## 0. Pre-flight checklist (do this before hitting record)

- [ ] Open the live dashboard and **wake the API** (free tier sleeps) ~1 min before recording by clicking any Run button.
- [ ] Hard-refresh so the seeded ledger (2 historical rows) and all **9 agents** show.
- [ ] Zoom browser to ~110%, hide bookmarks bar, use a clean desktop.
- [ ] Have the GitHub repo tab and the architecture diagram ready for cutaways.
- [ ] Record at 1080p; keep cursor movements slow and deliberate.
- [ ] Optional: open DevTools Network tab briefly to show real calls to the API.

---

## 1. Hook & Problem — (0:00–0:25)

**ON SCREEN:** Title card "Tender — Agentic commerce, settled with PayPal", then the live dashboard.

**VOICEOVER:**
> "AI agents can already shop, plan, and decide on our behalf. But there's a
> missing piece: when an agent agrees on a price, **how does the money actually
> move — safely, with a human in control?** Today, agents can't really pay.
> Tender fixes that. It's a platform where autonomous agents negotiate like
> humans and settle real payments through PayPal."

---

## 2. Solution Overview — (0:25–0:50)

**ON SCREEN:** Point to the stat strip (Settled volume, Transactions, Active agents, Pending approvals) and the Agent Rail of 9 agents.

**VOICEOVER:**
> "Here's the Tender control room. On one side, **buyer agents** with budgets and
> policies. On the other, competing **seller agents** — a grocery marketplace,
> two land brokers, and two car dealerships. Every agent has a wallet. When a
> buyer needs something, it sources offers from multiple sellers, **haggles**,
> and the winning deal is **settled through PayPal** — with spending guardrails
> and human approval built in."

---

## 3. Feature Walkthrough — Everyday commerce — (0:50–1:25)

**ON SCREEN:** Click **Run Shopping Agent**. Let the Activity Feed stream. Click the new ledger row to open **Negotiation Detail**.

**VOICEOVER:**
> "Watch the Pantry Butler restock groceries. It pings two competing merchants
> and negotiates with each — live, in the activity feed. Open any deal and you
> see the **full back-and-forth**: the seller defending price, the buyer pushing
> back, concessions, and a close. It picks the **cheapest** winning offer, checks
> its spend policy, and settles instantly via PayPal. That's an autonomous,
> end-to-end purchase in seconds."

**TIP:** Hover the negotiation rounds so viewers read a couple of lines of dialogue.

---

## 4. The headline feature — Land & Car agents bargaining like humans — (1:25–2:20)

**ON SCREEN:** Click **Buy Land**. Narrate the streaming negotiation. Then show the **Approval card** appear.

**VOICEOVER:**
> "Now the big one. Our **Acquisitions Concierge** — a family-office buyer — needs
> to buy land. It approaches **two competing brokers**, LandTrust and Prestige.
> Listen to how human this sounds: the broker cites *clean title, zoning, lake
> frontage, comparable sales*; the concierge counters with *pre-approved
> financing, comparable parcels, closing costs*. They trade offers over multiple
> rounds and converge on a price — and it automatically picks the cheaper broker."

**ON SCREEN:** Approve the pending approval in the Approvals Queue.

**VOICEOVER:**
> "Because this is a six-figure commitment, Tender's policy engine **pauses and
> asks a human**. I approve it — and only now does the money move: a real PayPal
> settlement to the winning seller. This is the key idea — **agents negotiate,
> humans stay in control, PayPal moves the money.**"

**ON SCREEN:** Click **Buy a Car** and let one more negotiation play to show it generalizes.

**VOICEOVER:**
> "Same flow for cars — dealers argue mileage and warranty, the buyer argues cash
> and trade-in. The engine is **category-aware**, so the haggling always sounds
> right for what's being sold."

---

## 5. Payouts & revenue splitting — (2:20–2:45)

**ON SCREEN:** Click **Run Freelancer Agent**. Show the payout transaction in the ledger.

**VOICEOVER:**
> "Tender isn't just buying. Here a Manager agent gets paid, then **automatically
> splits the revenue** to subcontractors using PayPal Payouts — one click,
> multiple recipients. That's agent-driven disbursement, not just checkout."

---

## 6. Under the hood — Guardrails, real-time, architecture — (2:45–3:05)

**ON SCREEN:** Point to Pending Approvals, Spend chart; optional cutaway to DevTools Network showing live API calls, then the repo.

**VOICEOVER:**
> "Everything is real-time over server-sent events. Every agent runs under a
> **policy** — per-transaction caps, daily caps, category allow-lists, and an
> approval threshold. React and Tailwind on the front end; Node, Express, and
> Prisma on the back; and a negotiation engine that runs deterministically **or**
> with a live LLM when a key is present."

---

## 7. PayPal integration & how it meets the hackathon brief — (3:05–3:30)

**ON SCREEN:** Show `TENDER_MODE` note or a slide listing PayPal APIs.

**VOICEOVER:**
> "Payments are powered by **PayPal's sandbox REST APIs** — the **Orders API** to
> create the purchase and the **Payouts API** to actually disburse funds to the
> seller agent, authenticated with OAuth 2.0. It runs in a safe **mock mode** for
> demos and flips to **live sandbox** with one environment variable. This is
> exactly the hackathon's vision: **AI agents transacting on PayPal rails**, with
> trust, guardrails, and a human in the loop."

---

## 8. Real-world e-commerce integration & benefits — (3:30–3:55)

**ON SCREEN:** Simple diagram slide: `Shopify / WooCommerce / any store  →  Tender agents  →  PayPal Orders + Payouts`.

**VOICEOVER:**
> "In the real world, Tender drops in between a storefront and PayPal. A merchant
> exposes their catalog; Tender's buyer agents negotiate and check out through the
> store's existing **PayPal** account using the same Orders and Payouts APIs. For
> marketplaces, the payout engine settles sellers automatically. The benefits:
> **lower cart abandonment, dynamic agent-to-agent pricing, instant multi-party
> settlement, and full spend governance** — all on rails businesses already trust."

---

## 9. Close & CTA — (3:55–4:00)

**ON SCREEN:** Title card with live URL + GitHub.

**VOICEOVER:**
> "Tender — where AI agents negotiate like humans, and PayPal settles the deal.
> Try the live demo, and thanks for watching."

---

## Shot list (quick reference)

| # | Action on screen | What you say |
| --- | --- | --- |
| 1 | Title → dashboard | Problem: agents can't pay safely |
| 2 | Stat strip + agent rail | The control room, buyers vs sellers |
| 3 | Run Shopping Agent → Negotiation Detail | Autonomous purchase + haggle |
| 4 | Buy Land → Approval → Approve; Buy a Car | Human-like bargaining + human-in-loop + PayPal |
| 5 | Run Freelancer Agent | Payouts / revenue split |
| 6 | Approvals, Spend chart, repo | Guardrails, real-time, stack |
| 7 | PayPal APIs slide | Orders + Payouts, mock/live, hackathon fit |
| 8 | Integration diagram | Real-world e-commerce + benefits |
| 9 | End card | CTA |

---

## Delivery tips

- **Lead with the land/car negotiation** — it's your most memorable moment; give it the most airtime.
- Keep energy up; read the on-screen agent dialogue out loud so judges notice it's human-like.
- Show the **approval pause** clearly — the human-in-the-loop is a core differentiator.
- If the free-tier API is slow to wake, pre-warm it and trim dead air in editing.
- End under 4:00; shorter and tighter beats long and complete.
