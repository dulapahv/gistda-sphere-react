import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { i18n } from "./i18n";

const navLabels: Record<string, { docs: string; playground: string }> = {
  en: { docs: "Docs", playground: "Playground" },
  th: { docs: "เอกสาร", playground: "ทดลองเล่น" },
};

export function baseOptions(lang?: string): BaseLayoutProps {
  const prefix = lang && lang !== i18n.defaultLanguage ? `/${lang}` : "";
  const labels = navLabels[lang ?? "en"] ?? navLabels.en;

  return {
    links: [
      {
        active: "nested-url",
        text: labels.docs,
        url: `${prefix}/docs`,
      },
      {
        external: true,
        text: labels.playground,
        url: `${prefix}/playground`,
      },
      {
        external: true,
        text: "GitHub",
        url: "https://github.com/dulapahv/gistda-sphere-react",
      },
    ],
    nav: {
      title: "gistda-sphere-react",
      url: `${prefix}`,
    },
  };
}
