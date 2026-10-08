import { X } from "lucide-react";
import type { Transaction } from "../lib/api";

export default function NegotiationDetail({
  txn,
  onClose,
}: {
  txn: Transaction | null;
  onClose: () => void;
}) {
  if (!txn) return null;
  const rounds = txn.offer?.rounds ?? [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto border-l border-ink-700 bg-ink-900 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Transaction Detail</h3>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-ink-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Info label="Item" value={txn.itemLabel ?? "—"} />
          <Info label="Amount" value={`$${txn.amount.toFixed(2)}`} />
          <Info label="Buyer" value={txn.buyer ?? "—"} />
          <Info label="Seller" value={txn.seller ?? "—"} />
          <Info label="Type" value={txn.type} />
          <Info label="Status" value={txn.status.replace("_", " ")} />
          <Info label="PayPal Ref" value={txn.paypalRef ?? "—"} mono full />
        </dl>

        <h4 className="mt-6 text-sm font-semibold text-slate-200">Negotiation History</h4>
        {rounds.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No negotiation recorded for this transaction.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {rounds.map((r, i) => (
              <div
                key={i}
                className={`flex ${r.actor === "buyer" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    r.actor === "buyer"
                      ? "bg-brand-500/15 text-brand-100"
                      : "bg-lime-500/15 text-lime-100"
                  }`}
                >
                  <p className="text-[11px] uppercase tracking-wide opacity-60">{r.actor}</p>
                  <p>{r.message}</p>
                  <p className="mt-0.5 text-xs font-semibold">${r.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  mono,
  full,
}: {
  label: string;
  value: string;
  mono?: boolean;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className={`text-slate-200 ${mono ? "font-mono text-xs text-brand-400" : ""}`}>{value}</dd>
    </div>
  );
}
