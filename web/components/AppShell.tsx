"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  color: string;
  actions?: ReactNode;
  children: ReactNode;
}

export default function AppShell({ title, subtitle, color, actions, children }: Props) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <motion.header
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{
          background: "rgba(0,0,0,0.5)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
        }}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="text-base font-semibold text-white">{title}</h1>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </motion.header>

      {/* Content */}
      <div
        className="flex-1 overflow-auto p-6"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 60% 20%, ${color}0a 0%, transparent 60%)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
