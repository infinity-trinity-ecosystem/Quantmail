"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Mic, Pin, Search, Zap, Trash2, Link2 } from "lucide-react";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import AppShell from "@/components/AppShell";
import clsx from "clsx";

interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  color: string;
  updated: string;
  linkedEvent?: string;
}

const initialNotes: Note[] = [
  { id: "1", title: "Q4 Vision",        content: "Build the world's most powerful AI workspace. Nine apps, one identity, zero friction...", pinned: true,  color: "#6c63ff", updated: "Just now",     linkedEvent: "Q4 Planning" },
  { id: "2", title: "Ideas Dump",       content: "- AI inbox filters\n- Voice-to-doc in meetings\n- Biometric SSO\n- x402 payments", pinned: true,  color: "#f59e0b", updated: "1h ago" },
  { id: "3", title: "Meeting Notes",    content: "Discussed: Series A pitch deck, target valuation $200M, key investors: Sequoia, a16z...", pinned: false, color: "#10b981", updated: "Yesterday" },
  { id: "4", title: "Book Summary: Zero to One", content: "Key insight: Build monopolies, not competitive markets. Secrets are the foundation...", pinned: false, color: "#ec4899", updated: "Last week" },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selected, setSelected] = useState<string>("1");
  const [recording, setRecording] = useState(false);

  const selectedNote = notes.find((n) => n.id === selected);
  const pinnedNotes = notes.filter((n) => n.pinned);
  const otherNotes = notes.filter((n) => !n.pinned);

  const updateContent = (id: string, content: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, content } : n)));
  };

  const togglePin = (id: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  };

  return (
    <WorkspaceLayout>
      <AppShell
        title="Notes"
        subtitle="Quick captures & AI formatting"
        color="#eab308"
        actions={
          <>
            <motion.button
              onClick={() => setRecording((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{
                background: recording ? "rgba(239,68,68,0.15)" : "rgba(234,179,8,0.1)",
                border: recording ? "1px solid rgba(239,68,68,0.35)" : "1px solid rgba(234,179,8,0.25)",
                color: recording ? "#ef4444" : "#eab308",
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Mic size={13} className={recording ? "animate-pulse" : ""} />
              {recording ? "Recording…" : "Voice Note"}
            </motion.button>
            <motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #eab308, #ca8a04)" }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Plus size={13} />
              New Note
            </motion.button>
          </>
        }
      >
        <div className="flex h-full gap-4">
          {/* Note list */}
          <div className="w-60 flex-shrink-0 flex flex-col gap-1 overflow-y-auto">
            {/* Search */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl mb-1"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <Search size={12} className="text-white/30" />
              <input placeholder="Search notes…" className="flex-1 bg-transparent text-xs text-white/60 outline-none placeholder-white/25" />
            </div>

            {pinnedNotes.length > 0 && (
              <>
                <div className="text-[10px] font-semibold uppercase tracking-widest px-1 py-1 flex items-center gap-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                  <Pin size={8} /> Pinned
                </div>
                {pinnedNotes.map((note, i) => (
                  <NoteListItem key={note.id} note={note} selected={selected} setSelected={setSelected} i={i} togglePin={togglePin} />
                ))}
              </>
            )}

            {otherNotes.length > 0 && (
              <>
                <div className="text-[10px] font-semibold uppercase tracking-widest px-1 py-1 mt-2" style={{ color: "rgba(255,255,255,0.25)" }}>
                  Notes
                </div>
                {otherNotes.map((note, i) => (
                  <NoteListItem key={note.id} note={note} selected={selected} setSelected={setSelected} i={i} togglePin={togglePin} />
                ))}
              </>
            )}
          </div>

          {/* Note editor */}
          <AnimatePresence mode="wait">
            {selectedNote && (
              <motion.div
                key={selectedNote.id}
                className="flex-1 flex flex-col rounded-xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                {/* Note header */}
                <div className="flex items-center gap-3 px-5 pt-6 pb-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: selectedNote.color }} />
                  <input
                    defaultValue={selectedNote.title}
                    className="flex-1 bg-transparent text-xl font-bold text-white outline-none"
                  />
                  <div className="flex items-center gap-1.5">
                    {selectedNote.linkedEvent && (
                      <span className="text-[10px] flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                        <Link2 size={9} />
                        {selectedNote.linkedEvent}
                      </span>
                    )}
                    <button
                      className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg"
                      style={{ background: "rgba(234,179,8,0.1)", color: "#eab308" }}
                    >
                      <Zap size={9} />
                      AI Format
                    </button>
                    <button onClick={() => togglePin(selectedNote.id)} className="text-white/25 hover:text-white/60 transition-colors">
                      <Pin size={14} className={selectedNote.pinned ? "text-yellow-400" : ""} />
                    </button>
                    <button className="text-white/25 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="px-5 pb-2 text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                  Updated {selectedNote.updated}
                </div>

                <textarea
                  className="flex-1 px-5 pb-6 bg-transparent text-sm leading-relaxed text-white/60 outline-none resize-none placeholder-white/20"
                  value={selectedNote.content}
                  onChange={(e) => updateContent(selectedNote.id, e.target.value)}
                  placeholder="Start writing… or tap the mic to speak"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </AppShell>
    </WorkspaceLayout>
  );
}

function NoteListItem({
  note, selected, setSelected, i, togglePin
}: {
  note: Note;
  selected: string;
  setSelected: (id: string) => void;
  i: number;
  togglePin: (id: string) => void;
}) {
  return (
    <motion.button
      onClick={() => setSelected(note.id)}
      className={clsx("w-full text-left px-3 py-2.5 rounded-xl transition-all group")}
      style={{
        background: selected === note.id ? "rgba(255,255,255,0.05)" : "transparent",
        border: selected === note.id ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
      }}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.05 }}
      whileHover={{ background: "rgba(255,255,255,0.04)" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: note.color }} />
        <span className="text-xs font-medium text-white/75 truncate flex-1">{note.title}</span>
      </div>
      <p className="text-[11px] truncate pl-3.5" style={{ color: "rgba(255,255,255,0.3)" }}>{note.content}</p>
      <div className="text-[10px] pl-3.5 mt-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>{note.updated}</div>
    </motion.button>
  );
}
