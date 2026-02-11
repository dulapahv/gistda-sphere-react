import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/lib/source";

// createFromSource auto-detects i18n from source._i18n and creates
// per-locale search indexes when i18n is configured.
// Thai is not supported by Orama's stemmers, so we map it to use
// the same tokenizer settings as English.
export const { GET } = createFromSource(source, {
  localeMap: {
    th: { language: "english" },
  },
});
