# Deploying Tender to Render

This guide walks you through deploying Tender to [Render](https://render.com)
using the `render.yaml` Blueprint already included in this repo. It creates two
free services:

- **`tender-api`** — Node + Express API (SQLite, re-seeded on each deploy)
- **`tender-web`** — Static React/Vite dashboard

> **Cost:** Both services run on Render's **free** plan (recurring cost `$0`).
> Render requires a card on file for identity verification and places a
> **temporary $1 hold** (not a charge) the first time. You are only billed if you
> manually upgrade a service.

---

## Prerequisites

- The project is pushed to GitHub (it is: `Shalinda99/tender`).
- A Render account — sign up at <https://dashboard.render.com> using
  **Sign in with GitHub**.

---

## Step 1 — Verify your identity (one-time)

1. On first use of Blueprints, Render shows an **Add Card** popup.
2. Enter your name, country, address, and card number, then click **Add Card**.
3. Render authorizes a temporary **$1 USD** hold to verify the card. You are
   **not charged**, and the hold reverses within a few days.

---

## Step 2 — Create the services from the Blueprint

1. Go to <https://dashboard.render.com>.
2. Click **New +** → **Blueprint**.
3. Select the **`Shalinda99/tender`** repository. Render auto-detects
   `render.yaml`.
4. Click **Apply**. Render provisions both services:
   - `tender-api` (Node web service)
   - `tender-web` (static site)

---

## Step 3 — Wait for the API to build and go live

1. Open the **`tender-api`** service and watch the **Logs** tab.
   The build runs: install → `prisma generate` → compile → `prisma db push` →
   seed → start.
2. Wait until the status shows **Live**.
3. Copy the service URL — it looks like `https://tender-api.onrender.com`.
4. Verify it works: open `https://tender-api.onrender.com/health` in a browser.
   You should see:

   ```json
   { "ok": true }
   ```

---

## Step 4 — Point the dashboard at the API

The frontend bakes the API URL in **at build time**, so it must be set before
the final web build.

1. Open the **`tender-web`** service → **Environment**.
2. Set the variable **`VITE_API_BASE`** to your API URL from Step 3, e.g.:

   ```
   https://tender-api.onrender.com
   ```

   (no trailing slash)
3. Click **Save Changes**.
4. Go to **Manual Deploy** → **Deploy latest commit** so the value is compiled
   into the build.

---

## Step 5 — Open the app

1. Open the **`tender-web`** URL, e.g. `https://tender-web.onrender.com`.
2. The dashboard loads and connects to the API.
3. Trigger a flow — **Run Shopping Agent**, **Run Big Purchase** (human
   approval), or **Run Freelancer Agent** — and watch events stream live.

---

## Step 6 (optional) — Enable real PayPal + AI

By default the API runs in **mock mode** (fully working, no keys needed). To use
the real PayPal sandbox and a real LLM:

1. Open **`tender-api`** → **Environment** and set:

   | Variable | Value |
   | --- | --- |
   | `TENDER_MODE` | `live` |
   | `PAYPAL_CLIENT_ID` | your sandbox client ID |
   | `PAYPAL_CLIENT_SECRET` | your sandbox client secret |
   | `LLM_PROVIDER` | `groq` |
   | `GROQ_API_KEY` | your Groq API key |
   | `LLM_MODEL` | `openai/gpt-oss-20b` |

2. **Save Changes** (this triggers a redeploy).
3. **Fund the sandbox business account** that owns your PayPal app under
   **Testing Tools → Sandbox Accounts**, or live payouts return
   `DENIED (insufficient funds)`.

---

## Step 7 (optional) — Tighten CORS

The API ships with `WEB_ORIGIN=*` so setup is frictionless. To restrict it to
your dashboard only:

1. Open **`tender-api`** → **Environment**.
2. Set `WEB_ORIGIN` to your exact web URL, e.g.
   `https://tender-web.onrender.com`.
3. **Save Changes** to redeploy.

---

## Good to know (free tier)

- **Cold starts:** free services sleep after ~15 minutes of inactivity and take
  ~50 seconds to wake. Open the app a minute before a demo to warm it up.
- **Data resets:** the API uses SQLite and re-seeds on each deploy/restart, so
  demo data is always fresh — but records created during a session are lost on
  restart. (Want persistence? Ask to switch to a free Render PostgreSQL.)
- **No auto-charges:** you are only billed if you manually upgrade a service.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `tender-api` build fails at Prisma | Ensure `DATABASE_URL=file:./dev.db` is set on the service (it is, via `render.yaml`). |
| Dashboard loads but shows no data / network errors | `VITE_API_BASE` is missing or wrong — set it (Step 4) and redeploy `tender-web`. |
| `/health` returns 404 | The API hasn't finished building, or you opened the web URL instead of the API URL. |
| CORS errors in the browser console | Set `WEB_ORIGIN` to `*` (default) or your exact web URL, then redeploy the API. |
| Changes not showing | Push to GitHub, then **Manual Deploy → Deploy latest commit** on the affected service. |
