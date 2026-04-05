import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quant Workspace — AI-Powered Super App",
  description: "The world's most powerful AI workspace. Mail, Calendar, Drive, Docs, Sheets, Chat, Meet, Tasks & Notes — all in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full bg-black text-white">{children}</body>
    </html>
  );
}

