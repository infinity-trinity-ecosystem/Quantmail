"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Video } from "lucide-react";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import AppShell from "@/components/AppShell";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const mockEvents = [
  { id: "1", title: "Team Standup", day: 1, hour: 9, duration: 1, color: "#6c63ff" },
  { id: "2", title: "Product Review", day: 3, hour: 14, duration: 2, color: "#ec4899" },
  { id: "3", title: "1:1 with CEO", day: 4, hour: 11, duration: 1, color: "#f97316" },
];

export default function CalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset * 7);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  return (
    <WorkspaceLayout>
      <AppShell
        title="Calendar"
        subtitle="Your week at a glance"
        color="#06b6d4"
        actions={
          <>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setWeekOffset((w) => w - 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => setWeekOffset(0)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setWeekOffset((w) => w + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
            <motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #06b6d4, #0e7490)" }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Plus size={13} />
              New Event
            </motion.button>
          </>
        }
      >
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            {days.map((day, i) => {
              const date = weekDates[i];
              const isToday =
                date.toDateString() === new Date().toDateString();
              return (
                <div key={day} className="py-3 text-center">
                  <div className="text-xs font-medium mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>{day}</div>
                  <div
                    className="mx-auto w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                    style={
                      isToday
                        ? { background: "#06b6d4", color: "#000" }
                        : { color: "rgba(255,255,255,0.7)" }
                    }
                  >
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time slots */}
          <div className="relative overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
            {Array.from({ length: 12 }, (_, hour) => (
              <div key={hour} className="grid grid-cols-7 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {days.map((_, dayIndex) => {
                  const h = hour + 8;
                  const event = mockEvents.find((e) => e.day === dayIndex && e.hour === h);
                  return (
                    <div
                      key={dayIndex}
                      className="relative border-r p-1"
                      style={{ minHeight: "60px", borderColor: "rgba(255,255,255,0.04)" }}
                    >
                      {dayIndex === 0 && (
                        <span
                          className="absolute -left-0 top-1 text-[10px] w-6 text-right"
                          style={{ color: "rgba(255,255,255,0.2)", transform: "translateX(-110%)" }}
                        >
                          {h}
                        </span>
                      )}
                      {event && (
                        <motion.div
                          className="rounded-lg px-2 py-1.5 text-xs font-medium cursor-pointer"
                          style={{
                            background: `${event.color}22`,
                            border: `1px solid ${event.color}44`,
                            color: event.color,
                          }}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.03 }}
                        >
                          <div className="flex items-center gap-1">
                            <Video size={10} />
                            <span className="truncate">{event.title}</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    </WorkspaceLayout>
  );
}
