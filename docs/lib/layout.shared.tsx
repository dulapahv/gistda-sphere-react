import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { i18n } from "./i18n";

const navLabels: Record<string, { docs: string; playground: string }> = {
  en: { docs: "Docs", playground: "Playground" },
  th: { docs: "เอกสาร", playground: "ทดลองเล่น" },
};

/** Returns shared layout options, localized for the given language. */
export function baseOptions(lang?: string): BaseLayoutProps {
  const prefix = lang && lang !== i18n.defaultLanguage ? `/${lang}` : "";
  const labels = navLabels[lang ?? "en"] ?? navLabels.en;

  return {
    nav: {
      title: "gistda-sphere-react",
    },
    links: [
      {
        text: labels.docs,
        url: `${prefix}/docs`,
        active: "nested-url",
      },
      {
        text: labels.playground,
        url: `${prefix}/playground`,
        external: true,
      },
      {
        text: "GitHub",
        url: "https://github.com/dulapahv/gistda-sphere-react",
        external: true,
      },
    ],
    i18n,
  };
}
