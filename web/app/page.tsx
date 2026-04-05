"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Globe } from "lucide-react";

const features = [
  { icon: Zap,    title: "AI-Powered",       desc: "Every app supercharged with Quant AI." },
  { icon: Shield, title: "Biometric Auth",    desc: "Facial liveness — no passwords needed." },
  { icon: Globe,  title: "All-in-One",        desc: "9 apps, one seamless workspace." },
];

const apps = [
  { label: "Mail",     color: "#6c63ff", href: "/mail"     },
  { label: "Calendar", color: "#06b6d4", href: "/calendar" },
  { label: "Drive",    color: "#10b981", href: "/drive"    },
  { label: "Docs",     color: "#f59e0b", href: "/docs"     },
  { label: "Sheets",   color: "#22c55e", href: "/sheets"   },
  { label: "Chat",     color: "#a78bfa", href: "/chat"     },
  { label: "Meet",     color: "#f97316", href: "/meet"     },
  { label: "Tasks",    color: "#ec4899", href: "/tasks"    },
  { label: "Notes",    color: "#eab308", href: "/notes"    },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black px-6 py-20">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(108,99,255,0.25) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: "800px",
          height: "300px",
          background:
            "radial-gradient(ellipse at center, rgba(236,72,153,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <span
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide"
          style={{
            background: "rgba(108,99,255,0.12)",
            border: "1px solid rgba(108,99,255,0.3)",
            color: "#a78bfa",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          Now in Production · 9-App AI Workspace
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-5xl sm:text-7xl font-black text-center leading-[1.05] tracking-tight max-w-4xl"
      >
        <span className="text-white">The AI Workspace</span>
        <br />
        <span
          style={{
            background: "linear-gradient(135deg, #6c63ff 0%, #a78bfa 50%, #ec4899 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          that replaces everything.
        </span>
      </motion.h1>

      {/* Sub */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-6 text-base sm:text-lg text-center max-w-2xl leading-relaxed"
        style={{ color: "rgba(255,255,255,0.45)" }}
      >
        Quant Workspace combines Mail, Calendar, Drive, Docs, Sheets, Chat, Meet, Tasks &amp; Notes
        into one biometric-secured, AI-driven super app. Goodbye, app switching.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-10 flex flex-col sm:flex-row items-center gap-4"
      >
        <Link href="/mail">
          <motion.button
            className="flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm text-white"
            style={{
              background: "linear-gradient(135deg, #6c63ff, #a78bfa)",
              boxShadow: "0 0 32px rgba(108,99,255,0.45)",
            }}
            whileHover={{ scale: 1.04, boxShadow: "0 0 48px rgba(108,99,255,0.6)" }}
            whileTap={{ scale: 0.97 }}
          >
            Open Workspace <ArrowRight size={15} />
          </motion.button>
        </Link>
        <button
          className="px-7 py-3 rounded-xl font-medium text-sm"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          Watch demo
        </button>
      </motion.div>

      {/* App grid */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="mt-16 flex flex-wrap justify-center gap-2"
      >
        {apps.map((app) => (
          <Link key={app.href} href={app.href}>
            <motion.span
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
              style={{
                background: `${app.color}14`,
                border: `1px solid ${app.color}30`,
                color: app.color,
              }}
              whileHover={{ scale: 1.07, background: `${app.color}22` }}
              whileTap={{ scale: 0.96 }}
            >
              {app.label}
            </motion.span>
          </Link>
        ))}
      </motion.div>

      {/* Feature row */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55 }}
        className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full"
      >
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl text-center"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + i * 0.08 }}
            >
              <Icon size={20} style={{ color: "rgba(255,255,255,0.5)" }} />
              <div>
                <div className="font-semibold text-sm text-white/80">{f.title}</div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{f.desc}</div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Footer hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-16 text-xs text-center"
        style={{ color: "rgba(255,255,255,0.2)" }}
      >
        Press <kbd className="px-1.5 py-0.5 rounded text-[10px] border" style={{ borderColor: "rgba(255,255,255,0.15)" }}>⌘K</kbd> anywhere to search all apps
      </motion.p>
    </div>
  );
}
