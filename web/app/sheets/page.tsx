"use client";

import { motion } from "framer-motion";
import { Plus, Zap, Table2 } from "lucide-react";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import AppShell from "@/components/AppShell";
import { useState } from "react";

type CellData = Record<string, string>;

const initialHeaders = ["Month", "Revenue", "Users", "Churn %", "MRR Growth"];
const initialRows: CellData[] = [
  { Month: "Jan 2025", Revenue: "$12,400", Users: "1,240", "Churn %": "2.1%", "MRR Growth": "+8.3%" },
  { Month: "Feb 2025", Revenue: "$15,800", Users: "1,580", "Churn %": "1.9%", "MRR Growth": "+11.2%" },
  { Month: "Mar 2025", Revenue: "$21,200", Users: "2,100", "Churn %": "1.5%", "MRR Growth": "+14.8%" },
  { Month: "Apr 2025", Revenue: "$28,900", Users: "2,890", "Churn %": "1.2%", "MRR Growth": "+18.1%" },
];

export default function SheetsPage() {
  const [rows, setRows] = useState<CellData[]>(initialRows);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  const updateCell = (rowIdx: number, col: string, val: string) => {
    setRows((prev) => prev.map((r, i) => (i === rowIdx ? { ...r, [col]: val } : r)));
  };

  return (
    <WorkspaceLayout>
      <AppShell
        title="Sheets"
        subtitle="Q1–Q4 Revenue Tracker"
        color="#22c55e"
        actions={
          <>
            <motion.button
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-green-400"
              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)" }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Zap size={13} />
              AI Analyze
            </motion.button>
            <motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Plus size={13} />
              Add Row
            </motion.button>
          </>
        }
      >
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* Formula bar */}
          <div
            className="flex items-center gap-3 px-4 py-2.5 border-b"
            style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.3)" }}
          >
            <Table2 size={13} className="text-white/30" />
            <span className="text-xs font-mono text-white/30">{selectedCell ?? "Select a cell…"}</span>
            <span className="ml-auto text-[10px] px-2 py-1 rounded" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
              {rows.length} rows · {initialHeaders.length} cols
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.4)" }}>
                  {initialHeaders.map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-[11px] font-semibold border-b border-r"
                      style={{ color: "rgba(255,255,255,0.4)", borderColor: "rgba(255,255,255,0.07)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <motion.tr
                    key={rowIdx}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: rowIdx * 0.06 }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    {initialHeaders.map((col) => {
                      const cellKey = `${rowIdx}-${col}`;
                      const isSelected = selectedCell === cellKey;
                      const isGrowth = col === "MRR Growth" && row[col]?.startsWith("+");
                      return (
                        <td
                          key={col}
                          className="px-4 py-2 border-b border-r"
                          style={{ borderColor: "rgba(255,255,255,0.05)" }}
                        >
                          <input
                            value={row[col] ?? ""}
                            onChange={(e) => updateCell(rowIdx, col, e.target.value)}
                            onFocus={() => setSelectedCell(cellKey)}
                            onBlur={() => setSelectedCell(null)}
                            className="w-full bg-transparent text-xs outline-none"
                            style={{
                              color: isGrowth
                                ? "#22c55e"
                                : isSelected
                                ? "#fff"
                                : "rgba(255,255,255,0.6)",
                            }}
                          />
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AppShell>
    </WorkspaceLayout>
  );
}
