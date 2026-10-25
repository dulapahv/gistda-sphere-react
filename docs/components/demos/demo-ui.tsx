"use client";

import { SphereProvider } from "gistda-sphere-react";
import type { ReactNode } from "react";
import { useDocLanguage } from "./use-doc-language";

export const API_KEY = process.env.NEXT_PUBLIC_SPHERE_API_KEY ?? "";

const MISSING_KEY = {
  en: "Set NEXT_PUBLIC_SPHERE_API_KEY in docs/.env.local to see live demos.",
  th: "ตั้งค่า NEXT_PUBLIC_SPHERE_API_KEY ใน docs/.env.local เพื่อดูตัวอย่างที่ใช้งานได้จริง",
};

/**
 * A bordered demo frame with its own `SphereProvider` in the docs language,
 * so maps in the examples follow the page language without a `language`
 * prop. Plain controls inside get the docs look from `.sphere-demo` styles.
 */
export function DemoFrame({
  children,
  height = "400px",
}: {
  children: ReactNode;
  /** Height of the placeholder shown when no API key is set. */
  height?: string;
}) {
  const language = useDocLanguage();
  if (!API_KEY) {
    return (
      <div
        className="not-prose my-4 flex w-full items-center justify-center rounded-xl border border-fd-border bg-fd-card p-4 text-center text-fd-muted-foreground text-sm"
        style={{ height }}
      >
        {MISSING_KEY[language]}
      </div>
    );
  }
  return (
    <div className="sphere-demo not-prose my-4 overflow-hidden rounded-xl border border-fd-border">
      <SphereProvider apiKey={API_KEY} language={language}>
        {children}
      </SphereProvider>
    </div>
  );
}
