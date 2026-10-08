import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { Transaction } from "../lib/api";

const COLORS = ["#3b82f6", "#a3e635", "#fbbf24", "#f472b6", "#22d3ee", "#c084fc"];

export default function SpendChart({ rows }: { rows: Transaction[] }) {
  const data = useMemo(() => {
    const bySeller = new Map<string, number>();
    for (const t of rows) {
      if (t.status !== "completed") continue;
      const key = t.seller ?? "Unknown";
      bySeller.set(key, (bySeller.get(key) ?? 0) + t.amount);
    }
    return [...bySeller.entries()]
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [rows]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-ink-700 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-200">Spend by Counterparty</h2>
      </div>
      <div className="flex-1 p-3">
        {data.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-slate-500">No settled spend yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "#1e2540" }}
                contentStyle={{
                  background: "#0f1320",
                  border: "1px solid #1e2540",
                  borderRadius: 8,
                  color: "#e5e7eb",
                }}
                formatter={(v: number) => [`$${v}`, "spend"]}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
