"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Inbox, Star, Send, Trash2, Pencil, Search, ChevronRight } from "lucide-react";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import AppShell from "@/components/AppShell";
import clsx from "clsx";

const folders = [
  { id: "inbox",  label: "Inbox",   icon: Inbox,   count: 3 },
  { id: "starred",label: "Starred", icon: Star,    count: 0 },
  { id: "sent",   label: "Sent",    icon: Send,    count: 0 },
  { id: "trash",  label: "Trash",   icon: Trash2,  count: 0 },
];

const mockEmails = [
  { id: "1", from: "team@quantworkspace.ai", subject: "Welcome to Quant Workspace 🚀", preview: "You're now part of the most powerful AI workspace on the planet...", time: "9:41 AM", read: false, starred: true },
  { id: "2", from: "ai@quantworkspace.ai",   subject: "Your AI Assistant is ready", preview: "Quant AI has processed your first 50 actions. Upgrade for unlimited...", time: "Yesterday", read: false, starred: false },
  { id: "3", from: "billing@stripe.com",     subject: "Invoice #1001 — $0.00", preview: "Your free tier invoice for this billing period...", time: "Mon", read: true, starred: false },
];

export default function MailPage() {
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [selected, setSelected] = useState<string | null>(null);

  const selectedEmail = mockEmails.find((e) => e.id === selected);

  return (
    <WorkspaceLayout>
      <AppShell
        title="Mail"
        subtitle={`${mockEmails.filter((e) => !e.read).length} unread`}
        color="#6c63ff"
        actions={
          <motion.button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #6c63ff, #a78bfa)" }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <Pencil size={13} />
            Compose
          </motion.button>
        }
      >
        <div className="flex h-full gap-4">
          {/* Sidebar */}
          <div className="w-44 flex-shrink-0 flex flex-col gap-1">
            {folders.map((f) => {
              const Icon = f.icon;
              const active = f.id === activeFolder;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFolder(f.id)}
                  className={clsx(
                    "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all",
                    active ? "text-white" : "text-white/40 hover:text-white/70"
                  )}
                  style={{
                    background: active ? "rgba(108,99,255,0.15)" : "transparent",
                    border: active ? "1px solid rgba(108,99,255,0.25)" : "1px solid transparent",
                  }}
                >
                  <Icon size={14} />
                  <span className="flex-1 text-left">{f.label}</span>
                  {f.count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(108,99,255,0.3)", color: "#a78bfa" }}>
                      {f.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Email list */}
          <div
            className="w-72 flex-shrink-0 flex flex-col rounded-xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {/* Search */}
            <div className="p-3 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }}>
                <Search size={12} className="text-white/30" />
                <input placeholder="Search mail…" className="flex-1 bg-transparent text-xs text-white/70 outline-none placeholder-white/25" />
              </div>
            </div>

            {/* Emails */}
            <div className="flex-1 overflow-y-auto">
              {mockEmails.map((email, i) => (
                <motion.div
                  key={email.id}
                  onClick={() => setSelected(email.id)}
                  className={clsx(
                    "px-3 py-3 border-b cursor-pointer transition-colors",
                    selected === email.id ? "bg-white/[0.06]" : "hover:bg-white/[0.03]",
                    !email.read && "border-l-2"
                  )}
                  style={{
                    borderColor: "rgba(255,255,255,0.06)",
                    borderLeftColor: !email.read ? "#6c63ff" : undefined,
                  }}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={clsx("text-xs font-medium truncate", email.read ? "text-white/50" : "text-white")}>
                      {email.from.split("@")[0]}
                    </span>
                    <span className="text-[10px] flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>{email.time}</span>
                  </div>
                  <div className={clsx("text-xs truncate mb-0.5", email.read ? "text-white/40" : "text-white/80 font-medium")}>
                    {email.subject}
                  </div>
                  <div className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.25)" }}>{email.preview}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Email view */}
          <div
            className="flex-1 rounded-xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {selectedEmail ? (
              <motion.div
                key={selectedEmail.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 h-full flex flex-col"
              >
                <h2 className="text-lg font-semibold text-white mb-2">{selectedEmail.subject}</h2>
                <div className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
                  From: {selectedEmail.from} · {selectedEmail.time}
                </div>
                <div className="flex-1 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {selectedEmail.preview}
                  <br /><br />
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>
                    — Sent with superhuman speed via Quant Workspace. Claim your AI assistant.
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  {["Reply", "Forward", "Archive"].map((action) => (
                    <motion.button
                      key={action}
                      className="px-4 py-2 rounded-xl text-xs font-medium"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
                      whileHover={{ scale: 1.04, background: "rgba(255,255,255,0.1)" }}
                      whileTap={{ scale: 0.96 }}
                    >
                      {action}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Inbox size={32} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.15)" }} />
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Select an email to read</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </WorkspaceLayout>
  );
}
