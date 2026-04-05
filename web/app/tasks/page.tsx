"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Zap, AlertCircle, Circle, CheckCircle2, Clock } from "lucide-react";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import AppShell from "@/components/AppShell";
import clsx from "clsx";

type Status = "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";

interface Task {
  id: string;
  title: string;
  priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW";
  status: Status;
  assignee: string;
}

const initialTasks: Task[] = [
  { id: "1", title: "Design new onboarding flow",         priority: "HIGH",   status: "IN_PROGRESS", assignee: "Arjun" },
  { id: "2", title: "Integrate Stripe payments",          priority: "URGENT", status: "TODO",        assignee: "Priya" },
  { id: "3", title: "Write API documentation",            priority: "MEDIUM", status: "BACKLOG",     assignee: "Unassigned" },
  { id: "4", title: "Fix mobile viewport bug",            priority: "HIGH",   status: "TODO",        assignee: "Arjun" },
  { id: "5", title: "Deploy to production on Vercel",     priority: "URGENT", status: "DONE",        assignee: "Priya" },
  { id: "6", title: "Add dark mode to all pages",         priority: "LOW",    status: "DONE",        assignee: "Arjun" },
];

const columns: { id: Status; label: string; icon: React.ElementType; color: string }[] = [
  { id: "BACKLOG",     label: "Backlog",     icon: Circle,       color: "#6b7280" },
  { id: "TODO",        label: "To Do",       icon: Clock,        color: "#6c63ff" },
  { id: "IN_PROGRESS", label: "In Progress", icon: AlertCircle,  color: "#f97316" },
  { id: "DONE",        label: "Done",        icon: CheckCircle2, color: "#22c55e" },
];

const priorityColors: Record<string, string> = {
  URGENT: "#ef4444",
  HIGH:   "#f97316",
  MEDIUM: "#eab308",
  LOW:    "#6b7280",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const moveTask = (taskId: string, newStatus: Status) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
  };

  return (
    <WorkspaceLayout>
      <AppShell
        title="Tasks"
        subtitle="Sprint board — Q4 2025"
        color="#ec4899"
        actions={
          <>
            <motion.button
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-pink-400"
              style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.25)" }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Zap size={13} />
              AI Sprint Plan
            </motion.button>
            <motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #ec4899, #be185d)" }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Plus size={13} />
              New Task
            </motion.button>
          </>
        }
      >
        <div className="flex gap-4 h-full overflow-x-auto pb-2">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            const Icon = col.icon;
            return (
              <div
                key={col.id}
                className="flex-shrink-0 w-64 flex flex-col rounded-xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggingId) moveTask(draggingId, col.id);
                  setDraggingId(null);
                }}
              >
                {/* Column header */}
                <div className="flex items-center gap-2 px-3 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                  <Icon size={13} style={{ color: col.color }} />
                  <span className="text-xs font-semibold text-white/70">{col.label}</span>
                  <span
                    className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ background: `${col.color}20`, color: col.color }}
                  >
                    {colTasks.length}
                  </span>
                </div>

                {/* Tasks */}
                <div className="flex-1 p-2 flex flex-col gap-2 overflow-y-auto">
                  <AnimatePresence>
                    {colTasks.map((task, i) => (
                      <motion.div
                        key={task.id}
                        draggable
                        onDragStart={() => setDraggingId(task.id)}
                        onDragEnd={() => setDraggingId(null)}
                        className={clsx(
                          "p-3 rounded-xl cursor-grab active:cursor-grabbing",
                          draggingId === task.id && "opacity-50"
                        )}
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.04 }}
                        whileHover={{ background: "rgba(255,255,255,0.07)" }}
                        layout
                      >
                        <p className="text-xs font-medium text-white/80 mb-2 leading-relaxed">{task.title}</p>
                        <div className="flex items-center justify-between">
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                            style={{ background: `${priorityColors[task.priority]}18`, color: priorityColors[task.priority] }}
                          >
                            {task.priority}
                          </span>
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                            style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
                          >
                            {task.assignee.charAt(0)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <button
                    className="mt-1 flex items-center gap-1.5 px-2 py-2 rounded-xl text-xs w-full transition-colors"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                  >
                    <Plus size={12} />
                    Add task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </AppShell>
    </WorkspaceLayout>
  );
}
