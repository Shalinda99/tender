import { Check, X, ShieldAlert } from "lucide-react";
import type { Approval } from "../lib/api";

export default function ApprovalsQueue({
  approvals,
  onDecide,
}: {
  approvals: Approval[];
  onDecide: (id: string, decision: "approved" | "rejected") => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-ink-700 px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <ShieldAlert className="h-4 w-4 text-fuchsia-400" /> Approvals Queue
        </h2>
        {approvals.length > 0 && (
          <span className="rounded-full bg-fuchsia-500/20 px-2 py-0.5 text-xs font-semibold text-fuchsia-300">
            {approvals.length}
          </span>
        )}
      </div>
      <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto p-3">
        {approvals.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-slate-500">
            No pending approvals. Agents are operating within policy.
          </p>
        )}
        {approvals.map((a) => (
          <div key={a.id} className="animate-fade rounded-lg border border-fuchsia-500/20 bg-ink-800/60 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">
                {a.transaction.itemLabel ?? "Transaction"}
              </span>
              <span className="font-semibold text-white">${a.transaction.amount.toFixed(2)}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {a.transaction.buyer} → {a.transaction.seller}
            </p>
            {a.reason && <p className="mt-1 text-[11px] text-fuchsia-300/80">{a.reason}</p>}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => onDecide(a.id, "approved")}
                className="flex flex-1 items-center justify-center gap-1 rounded-md bg-emerald-500/90 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
              >
                <Check className="h-4 w-4" /> Approve
              </button>
              <button
                onClick={() => onDecide(a.id, "rejected")}
                className="flex flex-1 items-center justify-center gap-1 rounded-md bg-ink-700 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-rose-500/80 hover:text-white"
              >
                <X className="h-4 w-4" /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
