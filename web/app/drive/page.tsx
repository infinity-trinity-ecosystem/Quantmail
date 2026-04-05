"use client";

import { motion } from "framer-motion";
import { Upload, FolderOpen, Grid3X3, List, Search, HardDrive, FileText, Image, FileArchive } from "lucide-react";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import AppShell from "@/components/AppShell";
import { useState } from "react";
import clsx from "clsx";

const files = [
  { id: "1", name: "Q4 Strategy.pdf",   type: "pdf",   size: "2.4 MB",  modified: "Today",     icon: FileText,    color: "#f59e0b" },
  { id: "2", name: "Brand Assets",      type: "folder",size: "48 files", modified: "Yesterday", icon: FolderOpen,  color: "#6c63ff" },
  { id: "3", name: "Product Demo.mp4",  type: "video", size: "124 MB",  modified: "Mon",        icon: FileArchive, color: "#ec4899" },
  { id: "4", name: "Logo Final.svg",    type: "image", size: "88 KB",   modified: "Last week",  icon: Image,       color: "#10b981" },
  { id: "5", name: "Budget 2025.xlsx",  type: "sheet", size: "340 KB",  modified: "Last week",  icon: FileText,    color: "#22c55e" },
  { id: "6", name: "Meeting Notes.md",  type: "doc",   size: "12 KB",   modified: "2 weeks ago",icon: FileText,    color: "#a78bfa" },
];

export default function DrivePage() {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <WorkspaceLayout>
      <AppShell
        title="Drive"
        subtitle="6 files · 2.1 GB used"
        color="#10b981"
        actions={
          <>
            <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              {(["grid", "list"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={clsx("w-8 h-8 flex items-center justify-center transition-colors", view === v ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60")}
                >
                  {v === "grid" ? <Grid3X3 size={14} /> : <List size={14} />}
                </button>
              ))}
            </div>
            <motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Upload size={13} />
              Upload
            </motion.button>
          </>
        }
      >
        {/* Search */}
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Search size={14} className="text-white/30" />
          <input placeholder="Search files…" className="flex-1 bg-transparent text-sm text-white/70 outline-none placeholder-white/25" />
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {files.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.id}
                  className="group rounded-xl p-4 flex flex-col gap-3 cursor-pointer transition-all"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}
                  >
                    <Icon size={18} style={{ color: f.color }} />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white/80 truncate">{f.name}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{f.size} · {f.modified}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-0 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            {files.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.id}
                  className="flex items-center gap-4 px-4 py-3 cursor-pointer border-b hover:bg-white/[0.03] transition-colors"
                  style={{ borderColor: "rgba(255,255,255,0.07)" }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${f.color}18` }}>
                    <Icon size={15} style={{ color: f.color }} />
                  </div>
                  <span className="flex-1 text-sm text-white/70">{f.name}</span>
                  <span className="text-xs text-white/30">{f.size}</span>
                  <span className="text-xs text-white/25">{f.modified}</span>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Storage bar */}
        <div className="mt-6 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-white/50 flex items-center gap-1.5"><HardDrive size={12} /> Storage</span>
            <span className="text-xs text-white/30">2.1 GB / 15 GB</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #10b981, #06b6d4)" }}
              initial={{ width: 0 }}
              animate={{ width: "14%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </AppShell>
    </WorkspaceLayout>
  );
}
