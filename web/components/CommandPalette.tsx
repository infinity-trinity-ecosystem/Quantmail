"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Search, Mail, Calendar, HardDrive, FileText,
  Table2, MessageSquare, Video, CheckSquare, StickyNote,
  ArrowRight, Zap,
} from "lucide-react";
import clsx from "clsx";

const commands = [
  { id: "mail",     label: "Open Mail",     desc: "Go to your inbox",              icon: Mail,          href: "/mail",     color: "#6c63ff" },
  { id: "calendar", label: "Open Calendar", desc: "View your schedule",            icon: Calendar,      href: "/calendar", color: "#06b6d4" },
  { id: "drive",    label: "Open Drive",    desc: "Your files & storage",          icon: HardDrive,     href: "/drive",    color: "#10b981" },
  { id: "docs",     label: "Open Docs",     desc: "AI-powered documents",          icon: FileText,      href: "/docs",     color: "#f59e0b" },
  { id: "sheets",   label: "Open Sheets",   desc: "Spreadsheets & data",           icon: Table2,        href: "/sheets",   color: "#22c55e" },
  { id: "chat",     label: "Open Chat",     desc: "Channels & direct messages",    icon: MessageSquare, href: "/chat",     color: "#a78bfa" },
  { id: "meet",     label: "Open Meet",     desc: "Video calls & AI notes",        icon: Video,         href: "/meet",     color: "#f97316" },
  { id: "tasks",    label: "Open Tasks",    desc: "Kanban & project tracking",     icon: CheckSquare,   href: "/tasks",    color: "#ec4899" },
  { id: "notes",    label: "Open Notes",    desc: "Quick captures & voice notes",  icon: StickyNote,    href: "/notes",    color: "#eab308" },
  { id: "ai",       label: "Ask Quant AI",  desc: "Intelligent assistant",         icon: Zap,           href: "/mail",     color: "#6c63ff" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = commands.filter(
    (c) =>
      query === "" ||
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.desc.toLowerCase().includes(query.toLowerCase())
  );

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      onClose();
      setQuery("");
    },
    [router, onClose]
  );

  useEffect(() => {
    if (open) {
      setSelected(0);
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      } else if (e.key === "Enter" && filtered[selected]) {
        navigate(filtered[selected].href);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, filtered, selected, navigate, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100]"
            style={{ background: "rgba(0,0,0,0.7)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            className="fixed top-[20vh] left-1/2 z-[101] w-full max-w-lg -translate-x-1/2"
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(10,10,10,0.96)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)",
                backdropFilter: "blur(32px)",
              }}
            >
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <Search size={16} className="text-white/30 flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search across all 9 apps…"
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                />
                <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-white/20 font-mono">
                  <span className="px-1.5 py-0.5 rounded border" style={{ borderColor: "rgba(255,255,255,0.1)" }}>esc</span>
                </kbd>
              </div>

              {/* Results */}
              <div className="py-2 max-h-80 overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-white/30">
                    No results for &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  filtered.map((cmd, i) => {
                    const Icon = cmd.icon;
                    const isSelected = i === selected;
                    return (
                      <motion.button
                        key={cmd.id}
                        className={clsx(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                          isSelected ? "text-white" : "text-white/60 hover:text-white"
                        )}
                        style={{
                          background: isSelected ? "rgba(255,255,255,0.06)" : "transparent",
                        }}
                        onClick={() => navigate(cmd.href)}
                        onMouseEnter={() => setSelected(i)}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${cmd.color}18`, border: `1px solid ${cmd.color}30` }}
                        >
                          <Icon size={14} style={{ color: cmd.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{cmd.label}</div>
                          <div className="text-xs text-white/30 truncate">{cmd.desc}</div>
                        </div>
                        {isSelected && (
                          <ArrowRight size={14} className="text-white/30 flex-shrink-0" />
                        )}
                      </motion.button>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <span className="text-[11px] text-white/20">Quant AI · 9 apps connected</span>
                <div className="flex items-center gap-2 text-[11px] text-white/20">
                  <span>↑↓ navigate</span>
                  <span>↵ select</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
