"use client";

import { SphereProvider } from "gistda-sphere-react";
import type { ReactNode } from "react";
import { useDocLanguage } from "./use-doc-language";

export const API_KEY = process.env.NEXT_PUBLIC_SPHERE_API_KEY ?? "";

const BUTTON =
  "cursor-pointer rounded-md border px-2 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const BUTTON_ON = "border-fd-primary bg-fd-primary text-fd-primary-foreground";
const BUTTON_OFF =
  "border-fd-border bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent";

const MISSING_KEY = {
  en: "Set NEXT_PUBLIC_SPHERE_API_KEY in docs/.env.local to see live demos.",
  th: "ตั้งค่า NEXT_PUBLIC_SPHERE_API_KEY ใน docs/.env.local เพื่อดูตัวอย่างที่ใช้งานได้จริง",
};

/** Picks the strings for the current docs language. */
export function useDemoText<T>(text: { en: T; th: T }): T {
  return text[useDocLanguage()];
}

/** A bordered demo frame with its own `SphereProvider`. */
export function DemoFrame({
  children,
  height = "400px",
}: {
  children: ReactNode;
  /** Height of the placeholder shown when no API key is set. */
  height?: string;
}) {
  const missingKey = useDemoText(MISSING_KEY);
  if (!API_KEY) {
    return (
      <div
        className="my-4 flex w-full items-center justify-center rounded-xl border border-fd-border bg-fd-card p-4 text-center text-fd-muted-foreground text-sm"
        style={{ height }}
      >
        {missingKey}
      </div>
    );
  }
  return (
    <div className="my-4 overflow-hidden rounded-xl border border-fd-border">
      <SphereProvider apiKey={API_KEY}>{children}</SphereProvider>
    </div>
  );
}

/** A row of controls under a demo map. */
export function DemoBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-fd-border border-t bg-fd-card p-3">
      {children}
    </div>
  );
}

/** A demo button; pass `active` to make it a toggle. */
export function DemoButton({
  active,
  children,
  disabled,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={`${BUTTON} ${active ? BUTTON_ON : BUTTON_OFF}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

/** Short text in a demo bar; `error` styles it as a problem. */
export function DemoNote({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "error";
}) {
  return (
    <span
      className={`text-xs ${tone === "error" ? "text-fd-error" : "text-fd-muted-foreground"}`}
      role={tone === "error" ? "alert" : undefined}
    >
      {children}
    </span>
  );
}
