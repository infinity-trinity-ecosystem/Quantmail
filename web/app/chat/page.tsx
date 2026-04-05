"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hash, Plus, Send, Smile, Paperclip, Zap } from "lucide-react";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import AppShell from "@/components/AppShell";
import clsx from "clsx";

const channels = [
  { id: "general",   name: "general",   unread: 3 },
  { id: "product",   name: "product",   unread: 0 },
  { id: "engineering",name: "engineering",unread: 7 },
  { id: "random",    name: "random",    unread: 1 },
];

type Message = { id: string; author: string; content: string; time: string; avatar: string };

const mockMessages: Record<string, Message[]> = {
  general: [
    { id: "1", author: "Arjun Kumar",  content: "Quant Workspace is live! 🚀", time: "9:41 AM", avatar: "A" },
    { id: "2", author: "Priya Sharma", content: "The UI looks absolutely incredible — better than Linear!", time: "9:43 AM", avatar: "P" },
    { id: "3", author: "Quant AI",     content: "🤖 AI Summary: Team is excited about the launch. Sentiment: Very Positive.", time: "9:43 AM", avatar: "Q" },
  ],
  engineering: [
    { id: "1", author: "Dev Bot",      content: "Build passed ✅  All 62 tests passing.", time: "10:00 AM", avatar: "D" },
    { id: "2", author: "Arjun Kumar",  content: "Deploying to Vercel now…", time: "10:02 AM", avatar: "A" },
  ],
};

const avatarColors: Record<string, string> = {
  A: "#6c63ff", P: "#ec4899", Q: "#f97316", D: "#10b981",
};

export default function ChatPage() {
  const [activeChannel, setActiveChannel] = useState("general");
  const [inputValue, setInputValue] = useState("");
  const messages = mockMessages[activeChannel] ?? [];

  const sendMessage = () => {
    if (!inputValue.trim()) return;
    setInputValue("");
  };

  return (
    <WorkspaceLayout>
      <AppShell
        title="Chat"
        subtitle="Real-time channels & direct messages"
        color="#a78bfa"
        actions={
          <motion.button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)" }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <Plus size={13} />
            New Channel
          </motion.button>
        }
      >
        <div className="flex h-full gap-4">
          {/* Channel list */}
          <div className="w-48 flex-shrink-0 flex flex-col gap-0.5">
            <div className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1.5 mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
              Channels
            </div>
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={clsx(
                  "flex items-center gap-2 px-2.5 py-2 rounded-xl text-sm transition-all w-full text-left",
                  activeChannel === ch.id ? "text-white" : "text-white/40 hover:text-white/70"
                )}
                style={{
                  background: activeChannel === ch.id ? "rgba(167,139,250,0.15)" : "transparent",
                }}
              >
                <Hash size={13} />
                <span className="flex-1 truncate">{ch.name}</span>
                {ch.unread > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "#a78bfa", color: "#000" }}>
                    {ch.unread}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Message area */}
          <div
            className="flex-1 flex flex-col rounded-xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {/* Channel header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <Hash size={14} style={{ color: "#a78bfa" }} />
              <span className="text-sm font-semibold text-white/80">{activeChannel}</span>
              <button className="ml-auto flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg" style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa" }}>
                <Zap size={11} />
                AI Summary
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: avatarColors[msg.avatar] ?? "#555", color: "#fff" }}
                    >
                      {msg.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm font-semibold text-white/80">{msg.author}</span>
                        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>{msg.time}</span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Input */}
            <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={`Message #${activeChannel}`}
                  className="flex-1 bg-transparent text-sm text-white/70 outline-none placeholder-white/25"
                />
                <div className="flex items-center gap-1.5">
                  <button className="text-white/25 hover:text-white/60 transition-colors"><Paperclip size={15} /></button>
                  <button className="text-white/25 hover:text-white/60 transition-colors"><Smile size={15} /></button>
                  <motion.button
                    onClick={sendMessage}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(167,139,250,0.3)", color: "#a78bfa" }}
                    whileHover={{ scale: 1.1, background: "rgba(167,139,250,0.5)" }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Send size={12} />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </WorkspaceLayout>
  );
}
