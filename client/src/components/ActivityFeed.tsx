import { Bot, CreditCard, ShieldCheck, Zap } from "lucide-react";
import type { TenderEvent } from "../lib/api";

const iconFor = (t: TenderEvent["type"]) => {
  switch (t) {
    case "negotiation":
      return <Bot className="h-4 w-4 text-brand-400" />;
    case "payment":
      return <CreditCard className="h-4 w-4 text-emerald-400" />;
    case "approval":
      return <ShieldCheck className="h-4 w-4 text-fuchsia-400" />;
    default:
      return <Zap className="h-4 w-4 text-amber-400" />;
  }
};

export default function ActivityFeed({ events }: { events: TenderEvent[] }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-ink-700 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-200">Live Agent Activity</h2>
        <span className="flex items-center gap-1.5 text-xs text-emerald-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> live
        </span>
      </div>
      <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto p-3">
        {events.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-slate-500">
            No activity yet. Run a scenario to watch agents work.
          </p>
        )}
        {events.map((e) => (
          <div
            key={e.id}
            className="animate-fade flex items-start gap-3 rounded-lg border border-ink-700 bg-ink-800/60 p-3"
          >
            <div className="mt-0.5">{iconFor(e.type)}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-200">{e.message}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {new Date(e.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
