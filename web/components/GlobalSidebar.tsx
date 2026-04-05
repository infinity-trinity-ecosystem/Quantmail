"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Calendar,
  HardDrive,
  FileText,
  Table2,
  MessageSquare,
  Video,
  CheckSquare,
  StickyNote,
  Settings,
  Search,
} from "lucide-react";
import clsx from "clsx";

const apps = [
  { id: "mail",     label: "Mail",     icon: Mail,          href: "/mail",     color: "#6c63ff" },
  { id: "calendar", label: "Calendar", icon: Calendar,      href: "/calendar", color: "#06b6d4" },
  { id: "drive",    label: "Drive",    icon: HardDrive,     href: "/drive",    color: "#10b981" },
  { id: "docs",     label: "Docs",     icon: FileText,      href: "/docs",     color: "#f59e0b" },
  { id: "sheets",   label: "Sheets",   icon: Table2,        href: "/sheets",   color: "#22c55e" },
  { id: "chat",     label: "Chat",     icon: MessageSquare, href: "/chat",     color: "#a78bfa" },
  { id: "meet",     label: "Meet",     icon: Video,         href: "/meet",     color: "#f97316" },
  { id: "tasks",    label: "Tasks",    icon: CheckSquare,   href: "/tasks",    color: "#ec4899" },
  { id: "notes",    label: "Notes",    icon: StickyNote,    href: "/notes",    color: "#eab308" },
];

interface Props {
  onCmdK: () => void;
}

export default function GlobalSidebar({ onCmdK }: Props) {
  const pathname = usePathname();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col items-center py-4 z-50"
      style={{
        width: "var(--sidebar-width)",
        background: "rgba(0,0,0,0.6)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      {/* Logo */}
      <motion.div
        className="mb-6 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
          style={{ background: "linear-gradient(135deg, #6c63ff, #ec4899)", boxShadow: "0 0 16px rgba(108,99,255,0.5)" }}
        >
          Q
        </div>
      </motion.div>

      {/* Search / Cmd+K */}
      <motion.button
        onClick={onCmdK}
        className="mb-4 w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white/80 transition-colors"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        title="Command Palette (⌘K)"
      >
        <Search size={16} />
      </motion.button>

      {/* App Icons */}
      <nav className="flex-1 flex flex-col items-center gap-1.5 w-full px-2">
        {apps.map((app, i) => {
          const isActive = pathname.startsWith(app.href);
          const isHovered = hoveredId === app.id;
          const Icon = app.icon;

          return (
            <div key={app.id} className="relative w-full flex justify-center">
              {/* Active indicator */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-1/2 w-0.5 h-6 rounded-full"
                    style={{ background: app.color, transform: "translateY(-50%)" }}
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    exit={{ scaleY: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>

              <Link href={app.href}>
                <motion.div
                  className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer",
                    isActive ? "text-white" : "text-white/40 hover:text-white/80"
                  )}
                  style={{
                    background: isActive
                      ? `${app.color}22`
                      : isHovered
                      ? "rgba(255,255,255,0.06)"
                      : "transparent",
                    border: isActive ? `1px solid ${app.color}44` : "1px solid transparent",
                    boxShadow: isActive ? `0 0 12px ${app.color}33` : "none",
                    animationDelay: `${i * 50}ms`,
                  }}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onHoverStart={() => setHoveredId(app.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  title={app.label}
                >
                  <Icon size={18} />
                </motion.div>
              </Link>

              {/* Tooltip */}
              <AnimatePresence>
                {isHovered && !isActive && (
                  <motion.div
                    className="absolute left-14 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-xs font-medium text-white pointer-events-none z-50 whitespace-nowrap"
                    style={{ background: "rgba(20,20,20,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    {app.label}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Settings */}
      <motion.button
        className="mt-4 w-10 h-10 rounded-xl flex items-center justify-center text-white/30 hover:text-white/70 transition-colors"
        whileHover={{ scale: 1.1, rotate: 30 }}
        whileTap={{ scale: 0.95 }}
        title="Settings"
      >
        <Settings size={17} />
      </motion.button>
    </aside>
  );
}
