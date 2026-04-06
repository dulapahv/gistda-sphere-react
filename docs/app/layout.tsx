import { Analytics } from "@vercel/analytics/next";
import { Inter } from "next/font/google";

import "./global.css";

const inter = Inter({
  subsets: ["latin"],
});

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    // biome-ignore lint/a11y/useHtmlLang: lang is set dynamically by [lang] segment via middleware
    <html className={inter.className} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Analytics />
        {children}
      </body>
    </html>
  );
}
