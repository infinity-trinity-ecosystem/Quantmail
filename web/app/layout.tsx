import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { GlobalSidebar } from "@/components/GlobalSidebar";

export const metadata: Metadata = {
  title: "Quant Workspace",
  description: "All-in-one AI-powered workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="h-full flex bg-zinc-50 dark:bg-zinc-950">
        <ThemeProvider>
          <GlobalSidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
