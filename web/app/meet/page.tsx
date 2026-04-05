"use client";

import { motion } from "framer-motion";
import { Video, Mic, MicOff, VideoOff, ScreenShare, MessageSquare, Users, Phone, Zap, Plus } from "lucide-react";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import AppShell from "@/components/AppShell";
import { useState } from "react";

const upcomingMeetings = [
  { id: "1", title: "Team Standup",    time: "9:00 AM · Today",    participants: 6 },
  { id: "2", title: "Investor Pitch",  time: "2:00 PM · Today",    participants: 4 },
  { id: "3", title: "Product Review",  time: "10:00 AM · Tomorrow", participants: 8 },
];

export default function MeetPage() {
  const [inCall, setInCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  return (
    <WorkspaceLayout>
      <AppShell
        title="Meet"
        subtitle="Video calls with AI transcription & notes"
        color="#f97316"
        actions={
          <motion.button
            onClick={() => setInCall(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <Plus size={13} />
            New Meeting
          </motion.button>
        }
      >
        {inCall ? (
          /* Active call UI */
          <motion.div
            className="flex flex-col h-full"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Video grid */}
            <div className="flex-1 grid grid-cols-2 gap-3 mb-4">
              {["You", "Arjun Kumar", "Priya Sharma", "AI Transcriber"].map((name, i) => (
                <motion.div
                  key={name}
                  className="relative rounded-2xl overflow-hidden flex items-center justify-center"
                  style={{
                    background: i === 0 ? "rgba(249,115,22,0.1)" : `rgba(${i * 30 + 30},${i * 20 + 20},${i * 50 + 50},0.3)`,
                    border: i === 0 ? "2px solid rgba(249,115,22,0.4)" : "1px solid rgba(255,255,255,0.07)",
                    minHeight: "160px",
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="text-center">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2"
                      style={{ background: i === 3 ? "rgba(249,115,22,0.3)" : "rgba(255,255,255,0.1)", color: i === 3 ? "#f97316" : "white" }}
                    >
                      {i === 3 ? "🤖" : name.charAt(0)}
                    </div>
                    <span className="text-xs text-white/70">{name}</span>
                  </div>
                  {i === 0 && (
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    </div>
                  )}
                  {i === 3 && (
                    <div className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-full animate-pulse" style={{ background: "rgba(249,115,22,0.3)", color: "#f97316" }}>
                      Transcribing…
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Live transcript */}
            <div
              className="p-3 rounded-xl mb-4"
              style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)" }}
            >
              <div className="flex items-center gap-1.5 mb-1.5 text-[11px]" style={{ color: "#f97316" }}>
                <Zap size={10} />
                AI Live Transcript
              </div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                Arjun: &ldquo;...so the key metrics we&apos;re targeting for Q4 are a 40% increase in DAUs and...&rdquo;
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <motion.button
                onClick={() => setMicOn((v) => !v)}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: micOn ? "rgba(255,255,255,0.1)" : "rgba(239,68,68,0.3)", border: "1px solid rgba(255,255,255,0.1)" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {micOn ? <Mic size={18} className="text-white" /> : <MicOff size={18} className="text-red-400" />}
              </motion.button>
              <motion.button
                onClick={() => setVideoOn((v) => !v)}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: videoOn ? "rgba(255,255,255,0.1)" : "rgba(239,68,68,0.3)", border: "1px solid rgba(255,255,255,0.1)" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {videoOn ? <Video size={18} className="text-white" /> : <VideoOff size={18} className="text-red-400" />}
              </motion.button>
              <motion.button
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ScreenShare size={18} className="text-white/60" />
              </motion.button>
              <motion.button
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <MessageSquare size={18} className="text-white/60" />
              </motion.button>
              <motion.button
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Users size={18} className="text-white/60" />
              </motion.button>
              <motion.button
                onClick={() => setInCall(false)}
                className="w-14 h-12 rounded-full flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.8)" }}
                whileHover={{ scale: 1.05, background: "rgba(239,68,68,1)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Phone size={18} className="text-white rotate-[135deg]" />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* Meeting lobby */
          <div className="flex flex-col gap-4 max-w-2xl">
            {/* New meeting card */}
            <motion.div
              className="p-6 rounded-2xl"
              style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.2)" }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-base font-semibold text-white mb-1">Start an instant meeting</h2>
              <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>AI will transcribe, take notes, and send a summary to Docs automatically.</p>
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setInCall(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Video size={15} />
                  Start Meeting
                </motion.button>
                <button
                  className="px-5 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
                >
                  Join with code
                </button>
              </div>
            </motion.div>

            {/* Upcoming meetings */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Upcoming</h3>
              <div className="flex flex-col gap-2">
                {upcomingMeetings.map((meeting, i) => (
                  <motion.div
                    key={meeting.id}
                    className="flex items-center gap-4 p-4 rounded-xl cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    whileHover={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.2)" }}
                    >
                      <Video size={16} style={{ color: "#f97316" }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white/80">{meeting.title}</div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{meeting.time} · {meeting.participants} participants</div>
                    </div>
                    <motion.button
                      className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.2)", color: "#f97316" }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setInCall(true)}
                    >
                      Join
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </AppShell>
    </WorkspaceLayout>
  );
}
