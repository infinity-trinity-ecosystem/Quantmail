"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, FileText, Zap, Bold, Italic, List } from "lucide-react";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import AppShell from "@/components/AppShell";

const mockDocs = [
  { id: "1", title: "Q4 Strategy Memo",    updated: "Just now",    preview: "Our key goals for Q4 are growth, retention, and..." },
  { id: "2", title: "Product Roadmap 2025", updated: "2h ago",      preview: "Phase 1: Core infrastructure. Phase 2: AI..." },
  { id: "3", title: "Marketing Playbook",   updated: "Yesterday",   preview: "Target audience: tech-savvy founders aged 25–45..." },
];

export default function DocsPage() {
  const [selected, setSelected] = useState<string>("1");
  const [content, setContent] = useState("Our key goals for Q4 are growth, retention, and product excellence. Quant AI will be our primary differentiator...");

  const selectedDoc = mockDocs.find((d) => d.id === selected);

  return (
    <WorkspaceLayout>
      <AppShell
        title="Docs"
        subtitle="AI-powered document editor"
        color="#f59e0b"
        actions={
          <>
            <motion.button
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-amber-400"
              style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Zap size={13} />
              AI Write
            </motion.button>
            <motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Plus size={13} />
              New Doc
            </motion.button>
          </>
        }
      >
        <div className="flex h-full gap-4">
          {/* Doc list */}
          <div className="w-56 flex-shrink-0 flex flex-col gap-1.5">
            {mockDocs.map((doc, i) => (
              <motion.button
                key={doc.id}
                onClick={() => setSelected(doc.id)}
                className="w-full text-left px-3 py-3 rounded-xl transition-all"
                style={{
                  background: selected === doc.id ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.02)",
                  border: selected === doc.id ? "1px solid rgba(245,158,11,0.25)" : "1px solid rgba(255,255,255,0.06)",
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ background: "rgba(255,255,255,0.05)" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileText size={12} style={{ color: "#f59e0b" }} />
                  <span className="text-xs font-medium text-white/80 truncate">{doc.title}</span>
                </div>
                <div className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.3)" }}>{doc.preview}</div>
                <div className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>{doc.updated}</div>
              </motion.button>
            ))}
          </div>

          {/* Editor */}
          <motion.div
            key={selected}
            className="flex-1 flex flex-col rounded-xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Toolbar */}
            <div className="flex items-center gap-1 px-4 py-2.5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              {[Bold, Italic, List].map((Icon, i) => (
                <button
                  key={i}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
                >
                  <Icon size={13} />
                </button>
              ))}
              <div className="ml-auto flex items-center gap-1.5">
                <span className="text-[10px] px-2 py-1 rounded-md" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>Auto-saved</span>
              </div>
            </div>

            {/* Title */}
            <div className="px-8 pt-8 pb-4">
              <input
                defaultValue={selectedDoc?.title}
                className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder-white/20"
                placeholder="Untitled"
              />
            </div>

            {/* Body */}
            <textarea
              className="flex-1 px-8 pb-8 bg-transparent text-sm leading-relaxed text-white/60 outline-none resize-none placeholder-white/20"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing… or press / for AI commands"
            />
          </motion.div>
        </div>
      </AppShell>
    </WorkspaceLayout>
  );
}
