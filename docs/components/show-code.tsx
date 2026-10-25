"use client";

import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import type { ReactNode } from "react";
import { useDocLanguage } from "./demos/use-doc-language";

/** The note reads "{before}<code>SphereProvider</code>{after}". */
const TEXT = {
  en: {
    after: ", like every component and hook in this library.",
    before: "Render it anywhere inside ",
    title: "Show code",
  },
  th: {
    after: " เช่นเดียวกับคอมโพเนนต์และ hooks ทั้งหมดของไลบรารีนี้",
    before: "ใช้งานได้ทุกที่ภายใน ",
    title: "แสดงโค้ด",
  },
};

/**
 * A closed section under a demo that holds the demo's full source, so long
 * examples don't push the rest of the page down. Put an `<include>` of the
 * example file inside it.
 */
export function ShowCode({ children }: { children: ReactNode }) {
  const text = TEXT[useDocLanguage()];
  return (
    <Accordions className="my-4" type="single">
      <Accordion title={text.title}>
        <p className="text-fd-muted-foreground text-sm">
          {text.before}
          <code>SphereProvider</code>
          {text.after}
        </p>
        {children}
      </Accordion>
    </Accordions>
  );
}
