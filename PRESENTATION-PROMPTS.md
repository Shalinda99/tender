# Tender — Presentation Builder Prompts

Hand this entire file to Claude (or any AI slide tool) and ask it to generate the
deck. It contains a **master prompt**, a **slide-by-slide spec** (title, bullets,
speaker notes, visual direction), and a **design system**. Everything is grounded
in the real project so the deck is accurate.

- **Live dashboard:** https://tender-web-686i.onrender.com
- **Live API:** https://tender-api-dtv0.onrender.com
- **Repo:** https://github.com/Shalinda99/tender

---

## MASTER PROMPT (paste this first)

> You are a senior pitch-deck designer. Create a **14-slide investor-grade
> presentation** for a hackathon project called **Tender — "Agentic commerce,
> settled with PayPal."** Produce it as a **.pptx file using python-pptx** (or, if
> you can't run code, output a clean slide-by-slide outline I can paste into
> PowerPoint/Google Slides/Gamma).
>
> Audience: **PayPal hackathon judges** scoring on innovation, PayPal API
> integration, business value, technical execution, and UX. Tone: confident,
> crisp, modern. Max ~6 bullets per slide, short phrases not sentences. Include
> **speaker notes** under each slide. Use the design system and the exact
> slide-by-slide content provided below. Where I mention a screenshot, insert a
> placeholder image box labeled with what to capture.

---

## DESIGN SYSTEM

- **Theme:** dark, fintech, premium. Background `#0B0F17` (ink), cards `#111827`.
- **Accent colors:** PayPal blue `#0070E0` + a tender-lime `#C6F432` + emerald `#10B981`.
- **Text:** white headings, `#94A3B8` (slate) body.
- **Font:** Inter / Poppins (headings bold, body regular).
- **Visual motifs:** agent avatars (🧭 🏡 🏙️ 🚗 🏎️ 🛒), chat bubbles for negotiation, lock/shield icons for guardrails, PayPal logo for settlement.
- **Consistency:** every slide has a short title top-left, slide number bottom-right, subtle accent divider line.

---

## SLIDE-BY-SLIDE SPEC

### Slide 1 — Title
- **Title:** Tender
- **Subtitle:** Agentic commerce, settled with PayPal
- **Footer:** Live demo URL + GitHub + hackathon name/date
- **Visual:** Logo mark, dark hero background with faint network/agent graphic.
- **Notes:** One line — "AI agents that negotiate like humans and pay through PayPal."

### Slide 2 — The Problem
- **Title:** Agents can decide — but they can't pay
- **Bullets:**
  - AI agents can shop, plan, and choose on our behalf
  - But there's no safe way for them to **move money**
  - No negotiation, no spend control, no human oversight
  - Result: agentic commerce stalls at checkout
- **Visual:** An agent reaching a "paywall / dead end" icon.
- **Notes:** Frame the gap between agent intelligence and real settlement.

### Slide 3 — The Solution
- **Title:** Tender: negotiate → approve → settle
- **Bullets:**
  - Buyer & seller **agents with wallets** and policies
  - **Human-like, multi-round negotiation** between agents
  - **Policy guardrails** + human-in-the-loop approvals
  - **PayPal** settles the deal (Orders + Payouts)
- **Visual:** 3-step flow: Negotiate → Approve → Settle (PayPal logo on step 3).
- **Notes:** This is the one-sentence pitch; land it clearly.

### Slide 4 — Live Product (screenshot)
- **Title:** The Tender control room
- **Bullets:** Real-time dashboard · 9 agents · live ledger · approvals · spend analytics
- **Visual:** **Screenshot** of the live dashboard (stat strip + agent rail + ledger).
- **Notes:** Mention it's live on Render right now.

### Slide 5 — Feature: Autonomous shopping
- **Title:** Agents that source the best deal
- **Bullets:**
  - Buyer pings **multiple competing sellers**
  - Negotiates with each, picks the **cheapest** winning offer
  - Settles via PayPal in seconds
- **Visual:** **Screenshot** of the Negotiation Detail panel (chat rounds).
- **Notes:** Everyday commerce example (groceries).

### Slide 6 — Headline Feature: Land & Car agents bargaining like humans
- **Title:** Human-like negotiation on big-ticket deals
- **Bullets:**
  - Acquisitions Concierge vs **two land brokers** / **two car dealers**
  - Category-aware arguments: *title, zoning, frontage* / *mileage, warranty, cash*
  - Multi-round concessions → converges on a price
  - Auto-selects the cheaper competitor
- **Visual:** Chat-bubble mockup of a land negotiation (buyer vs 2 sellers).
- **Notes:** This is the differentiator — spend the most time here.

### Slide 7 — Trust: Guardrails & human-in-the-loop
- **Title:** Autonomy with control
- **Bullets:**
  - Per-transaction & daily spend caps
  - Category allow-lists per agent
  - **Approval threshold** → six-figure buys pause for human sign-off
  - Approve/reject before any money moves
- **Visual:** Shield/lock icons + screenshot of the Approvals Queue.
- **Notes:** Judges care about safety — emphasize money only moves after approval.

### Slide 8 — PayPal Integration
- **Title:** Powered by PayPal rails
- **Bullets:**
  - **Orders API (v2)** — create the purchase
  - **Payouts API (v1)** — disburse funds to the seller agent
  - **OAuth 2.0** client-credentials auth, PayPal **Sandbox**
  - **Mock ↔ Live** switch via one env var (`TENDER_MODE`)
- **Visual:** PayPal logo + API call flow diagram.
- **Notes:** Be specific — name the APIs and the auth; this scores PayPal-integration points.

### Slide 9 — Payouts: revenue splitting
- **Title:** Not just checkout — disbursement
- **Bullets:**
  - Manager agent gets paid, **auto-splits** to subcontractors
  - One batch → multiple recipients via PayPal Payouts
  - Agent-driven settlement for marketplaces & gig work
- **Visual:** 1-to-many payout diagram.
- **Notes:** Shows breadth beyond buying.

### Slide 10 — Architecture
- **Title:** How it's built
- **Bullets:**
  - Frontend: React + Vite + TailwindCSS, real-time **SSE**
  - Backend: Node + Express + Prisma (SQLite)
  - Negotiation engine: deterministic **or** live LLM (Groq/OpenRouter)
  - Deployed on Render (blueprint, two services)
- **Visual:** Boxes: Browser → API → PayPal; LLM + DB side boxes.
- **Notes:** Keep technical but readable.

### Slide 11 — Real-world e-commerce integration
- **Title:** Drops into any storefront
- **Bullets:**
  - Sits between **Shopify / WooCommerce / any store** and PayPal
  - Uses the merchant's existing PayPal account (Orders + Payouts)
  - Buyer agents negotiate & check out programmatically
  - Marketplaces auto-settle sellers
- **Visual:** Diagram: Store → Tender agents → PayPal.
- **Notes:** Make the adoption path concrete and low-friction.

### Slide 12 — Business value & benefits
- **Title:** Why it matters
- **Bullets:**
  - Dynamic **agent-to-agent pricing** → better deals
  - **Instant multi-party settlement** → faster cash flow
  - **Spend governance** → enterprise-ready trust
  - Lower friction → higher conversion for agentic buyers
- **Visual:** 4 benefit tiles with icons.
- **Notes:** Tie each benefit to a buyer persona (consumer, marketplace, enterprise).

### Slide 13 — Hackathon fit
- **Title:** Built for the PayPal brief
- **Bullets:**
  - **Agentic AI + PayPal payments**, end to end
  - Real PayPal Sandbox APIs (Orders + Payouts)
  - Innovation: human-like multi-agent negotiation
  - UX + safety: live dashboard, guardrails, approvals
- **Visual:** Checklist mapping features → judging criteria.
- **Notes:** Explicitly map to innovation / integration / value / execution / UX.
  (Cross-check against the official rubric and adjust wording.)

### Slide 14 — Closing / CTA
- **Title:** Tender — agents negotiate, PayPal settles
- **Bullets:** Live demo URL · GitHub · "Try it now"
- **Visual:** Logo + QR code to the live dashboard.
- **Notes:** End with the one-liner and a clear call to action.

---

## OPTIONAL ADD-ONS (ask Claude for these if you want)

- A **30-second elevator-pitch** version (5 slides: Problem, Solution, Demo, PayPal, CTA).
- **Speaker-notes-only** export for teleprompter.
- A **light theme** variant for printed handouts.
- An **architecture diagram** rendered as an image (ask Claude to output Mermaid or SVG).

---

## FACTS SHEET (so the AI stays accurate — don't let it invent features)

- **Name/tagline:** Tender — "Agentic commerce, settled with PayPal."
- **Agents (9):** buyer *Pantry Butler*; sellers *FreshCo*, *DailyGoods Co*; manager (freelancer); high-value buyer *Acquisitions Concierge*; land sellers *LandTrust Estates*, *Prestige Properties*; car sellers *AutoSphere Motors*, *DriveLine Auto*.
- **Scenarios/buttons:** Run Shopping Agent (groceries), Run Big Purchase (appliances), **Buy Land** (real-estate), **Buy a Car** (automotive), Run Freelancer Agent (payout split).
- **Negotiation:** multi-round, category-aware, human-like; deterministic engine by default, optional live LLM (Groq/OpenRouter) when a key is set.
- **Guardrails:** per-transaction cap, daily cap, category allow-list, approval threshold (large buys require human approval before settlement).
- **PayPal:** Sandbox REST — **Orders API v2** (create order) + **Payouts API v1** (disburse to seller); OAuth2 client credentials; `TENDER_MODE=mock|live`.
- **Stack:** React + Vite + Tailwind (SSE live updates); Node + Express + Prisma + SQLite; deployed on Render.
- **Do NOT claim:** credit-card vaulting, production PayPal, real fiat movement, or any feature not listed here.
