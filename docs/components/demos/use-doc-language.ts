"use client";

import { useParams } from "next/navigation";

/**
 * Returns the current docs locale as a map language value.
 * Falls back to "en" for unknown locales.
 */
export function useDocLanguage(): "th" | "en" {
  const { lang } = useParams<{ lang: string }>();
  return lang === "th" ? "th" : "en";
}
