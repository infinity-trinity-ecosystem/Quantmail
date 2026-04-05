"use client";

import { useState, useEffect, useCallback } from "react";
import GlobalSidebar from "@/components/GlobalSidebar";
import CommandPalette from "@/components/CommandPalette";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const [cmdOpen, setCmdOpen] = useState(false);

  const openCmd = useCallback(() => setCmdOpen(true), []);
  const closeCmd = useCallback(() => setCmdOpen(false), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      <GlobalSidebar onCmdK={openCmd} />
      <main
        className="flex-1 overflow-hidden"
        style={{ marginLeft: "var(--sidebar-width)" }}
      >
        {children}
      </main>
      <CommandPalette open={cmdOpen} onClose={closeCmd} />
    </div>
  );
}
