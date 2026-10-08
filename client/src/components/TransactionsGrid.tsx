import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import type { Transaction } from "../lib/api";

const money = (p: ValueFormatterParams) =>
  p.value == null ? "" : `$${Number(p.value).toFixed(2)}`;

function StatusChip({ value }: { value: string }) {
  const map: Record<string, string> = {
    completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    awaiting_approval: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",
    failed: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  };
  const cls = map[value] ?? "bg-slate-500/15 text-slate-300 border-slate-500/30";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>
      {value.replace("_", " ")}
    </span>
  );
}

const TypeBadge = ({ value }: { value: string }) => (
  <span className="rounded-md bg-ink-700 px-2 py-0.5 text-xs uppercase tracking-wide text-slate-300">
    {value}
  </span>
);

export default function TransactionsGrid({
  rows,
  onSelect,
}: {
  rows: Transaction[];
  onSelect: (t: Transaction) => void;
}) {
  const columnDefs = useMemo<ColDef<Transaction>[]>(
    () => [
      {
        headerName: "Time",
        field: "createdAt",
        valueFormatter: (p) => new Date(p.value).toLocaleTimeString(),
        width: 110,
        sort: "desc",
      },
      { headerName: "Type", field: "type", width: 110, cellRenderer: TypeBadge },
      { headerName: "Buyer", field: "buyer", flex: 1, enableRowGroup: true },
      { headerName: "Seller", field: "seller", flex: 1, enableRowGroup: true },
      { headerName: "Item", field: "itemLabel", flex: 1.3 },
      {
        headerName: "Amount",
        field: "amount",
        valueFormatter: money,
        aggFunc: "sum",
        width: 120,
        type: "rightAligned",
        cellClass: "font-semibold text-white",
      },
      { headerName: "Status", field: "status", width: 160, cellRenderer: StatusChip },
      {
        headerName: "PayPal Ref",
        field: "paypalRef",
        flex: 1,
        cellClass: "text-brand-400 font-mono text-xs",
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({ sortable: true, filter: true, resizable: true, suppressHeaderMenuButton: false }),
    []
  );

  return (
    <div className="ag-theme-quartz-dark h-full w-full">
      <AgGridReact<Transaction>
        rowData={rows}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        animateRows
        rowGroupPanelShow="onlyWhenGrouping"
        onRowClicked={(e) => e.data && onSelect(e.data)}
        getRowId={(p) => p.data.id}
      />
    </div>
  );
}
