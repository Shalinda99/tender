import { Wallet } from "lucide-react";
import type { Agent } from "../lib/api";

const typeColor: Record<string, string> = {
  buyer: "text-brand-400 border-brand-500/30 bg-brand-500/10",
  seller: "text-tender-lime border-lime-500/30 bg-lime-500/10",
  manager: "text-tender-gold border-amber-500/30 bg-amber-500/10",
};

export default function AgentRail({ agents }: { agents: Agent[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {agents.map((a) => (
        <div key={a.id} className="rounded-xl border border-ink-700 bg-ink-800/60 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-700 text-xl">
              {a.avatar ?? "\uD83E\uDD16"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{a.name}</p>
              <p className="truncate text-xs text-slate-500">{a.owner}</p>
            </div>
          </div>
          <span
            className={`mt-3 inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${
              typeColor[a.type] ?? "text-slate-300 border-slate-600 bg-slate-700/30"
            }`}
          >
            {a.type} agent
          </span>
          <div className="mt-3 flex items-center justify-between border-t border-ink-700 pt-3 text-xs">
            <span className="flex items-center gap-1 text-slate-400">
              <Wallet className="h-3.5 w-3.5" /> balance
            </span>
            <span className="font-semibold text-white">
              ${(a.wallet?.balanceCached ?? 0).toFixed(0)}
            </span>
          </div>
          {a.policy && (
            <p className="mt-1 text-[11px] text-slate-500">
              cap ${a.policy.perTxnCap}/txn · approve &gt; ${a.policy.approvalThreshold}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
