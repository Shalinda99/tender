import { useCallback, useEffect, useRef, useState } from "react";
import { ShoppingCart, Briefcase, Activity, CircleDollarSign, ShieldAlert } from "lucide-react";
import { api, type Agent, type Transaction, type TenderEvent, type Approval } from "./lib/api";
import AgentRail from "./components/AgentRail";
import TransactionsGrid from "./components/TransactionsGrid";
import ActivityFeed from "./components/ActivityFeed";
import ApprovalsQueue from "./components/ApprovalsQueue";
import SpendChart from "./components/SpendChart";
import NegotiationDetail from "./components/NegotiationDetail";

export default function App() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [events, setEvents] = useState<TenderEvent[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [mode, setMode] = useState<"live" | "mock">("mock");
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [busy, setBusy] = useState(false);
  const refreshTimer = useRef<number | null>(null);

  const refreshData = useCallback(async () => {
    const [tx, ap, ag] = await Promise.all([
      api.transactions(),
      api.approvals(),
      api.agents(),
    ]);
    setTransactions(tx);
    setApprovals(ap);
    setAgents(ag);
  }, []);

  useEffect(() => {
    api.agents().then(setAgents).catch(() => {});
    api.events().then((e) => setEvents(e.reverse())).catch(() => {});
    api.mode().then((m) => setMode(m.paypal)).catch(() => {});
    refreshData().catch(() => {});

    const es = new EventSource(api.streamUrl);
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as TenderEvent;
        if (!data.id) return; // skip connect/heartbeat
        setEvents((prev) => [data, ...prev].slice(0, 200));
        // Debounced data refresh on each event.
        if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
        refreshTimer.current = window.setTimeout(() => refreshData().catch(() => {}), 250);
      } catch {
        /* ignore */
      }
    };
    return () => es.close();
  }, [refreshData]);

  const runShopping = async (category = "groceries") => {
    setBusy(true);
    try {
      await api.runShopping(category);
    } finally {
      setTimeout(() => setBusy(false), 1500);
    }
  };

  const runFreelancer = async () => {
    setBusy(true);
    try {
      await api.runFreelancer();
    } finally {
      setTimeout(() => setBusy(false), 1500);
    }
  };

  const decide = async (id: string, decision: "approved" | "rejected") => {
    try {
      await api.decideApproval(id, decision);
    } catch (err) {
      // e.g. 409 if already decided elsewhere — just resync state.
      console.warn("Approval decision failed:", err);
    } finally {
      await refreshData().catch(() => {});
    }
  };

  const totalSettled = transactions
    .filter((t) => t.status === "completed")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-ink-700 bg-ink-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-tender-lime text-lg font-black text-ink-950">
              T
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">Tender</h1>
              <p className="-mt-1 text-xs text-slate-500">Agentic commerce, settled with PayPal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                mode === "live"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-400"
              }`}
            >
              PayPal: {mode}
            </span>
            <button
              onClick={() => runShopping("groceries")}
              disabled={busy}
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" /> Run Shopping Agent
            </button>
            <button
              onClick={() => runShopping("appliances")}
              disabled={busy}
              className="flex items-center gap-2 rounded-lg bg-fuchsia-600/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-fuchsia-500 disabled:opacity-50"
            >
              <ShieldAlert className="h-4 w-4" /> Run Big Purchase
            </button>
            <button
              onClick={() => runFreelancer()}
              disabled={busy}
              className="flex items-center gap-2 rounded-lg bg-ink-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-ink-800 disabled:opacity-50"
            >
              <Briefcase className="h-4 w-4" /> Run Freelancer Agent
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-4 px-6 py-5">
        {/* Stat strip */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat icon={<CircleDollarSign className="h-5 w-5 text-emerald-400" />} label="Settled volume" value={`$${totalSettled.toFixed(2)}`} />
          <Stat icon={<Activity className="h-5 w-5 text-brand-400" />} label="Transactions" value={String(transactions.length)} />
          <Stat icon={<ShoppingCart className="h-5 w-5 text-tender-lime" />} label="Active agents" value={String(agents.length)} />
          <Stat icon={<Briefcase className="h-5 w-5 text-fuchsia-400" />} label="Pending approvals" value={String(approvals.length)} />
        </div>

        {/* Agents */}
        <AgentRail agents={agents} />

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <section className="xl:col-span-2 rounded-xl border border-ink-700 bg-ink-900">
            <div className="flex items-center justify-between border-b border-ink-700 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-200">Transaction Ledger</h2>
              <span className="text-xs text-slate-500">click a row for negotiation detail</span>
            </div>
            <div className="h-[460px] p-2">
              <TransactionsGrid rows={transactions} onSelect={setSelected} />
            </div>
          </section>

          <section className="rounded-xl border border-ink-700 bg-ink-900">
            <ActivityFeed events={events} />
          </section>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className="h-[320px] rounded-xl border border-ink-700 bg-ink-900">
            <ApprovalsQueue approvals={approvals} onDecide={decide} />
          </section>
          <section className="h-[320px] rounded-xl border border-ink-700 bg-ink-900">
            <SpendChart rows={transactions} />
          </section>
        </div>
      </main>

      <NegotiationDetail txn={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-900 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-800">{icon}</div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
