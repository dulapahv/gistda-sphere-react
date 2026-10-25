"use client";

import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { TABS, type TabId } from "../constants";
import type { PlaygroundTranslations } from "../translations";
import { MapStats } from "./MapStats";

/** The playground sidebar: header, camera stats, tabs and tab panels. */
export function Sidebar({
  activeTab,
  lang,
  onTabChange,
  panels,
  t,
}: {
  activeTab: TabId;
  lang: string;
  onTabChange: (tab: TabId) => void;
  /** Every tab's content. Inactive tabs stay mounted (hidden) to keep state. */
  panels: Record<TabId, ReactNode>;
  t: PlaygroundTranslations;
}) {
  const docsHref = lang === "en" ? "/docs" : `/${lang}/docs`;

  return (
    <aside className="flex h-full w-90 shrink-0 flex-col overflow-hidden border-fd-border border-r bg-fd-card text-fd-foreground max-md:h-[45vh] max-md:w-full max-md:border-r-0 max-md:border-b">
      <header className="shrink-0 border-fd-border border-b px-4 pt-3 pb-3">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h1 className="m-0 font-semibold text-fd-foreground text-sm tracking-tight">
              GISTDA Sphere React
            </h1>
            <p className="mt-0.5 text-fd-muted-foreground text-xs">
              {t.header.subtitle}
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-1 text-[11px] text-fd-muted-foreground no-underline hover:text-fd-foreground"
            href={docsHref as Route}
            title={t.header.backToDocs}
          >
            {t.header.docs}
            <ArrowSquareOutIcon size={12} />
          </Link>
        </div>
        <MapStats t={t} />
      </header>

      <div
        aria-label={t.header.tabs}
        className="grid shrink-0 grid-cols-6 border-fd-border border-b"
        role="tablist"
      >
        {TABS.map(({ icon: Icon, id }) => {
          const selected = id === activeTab;
          return (
            <button
              aria-controls={`playground-panel-${id}`}
              aria-selected={selected}
              className={`flex cursor-pointer flex-col items-center gap-0.5 border-b-2 px-1 py-2 text-[10.5px] transition-colors ${
                selected
                  ? "border-fd-primary font-semibold text-fd-foreground"
                  : "border-transparent text-fd-muted-foreground hover:text-fd-foreground"
              }`}
              id={`playground-tab-${id}`}
              key={id}
              onClick={() => onTabChange(id)}
              role="tab"
              type="button"
            >
              <Icon size={16} />
              {t.tabs[id]}
            </button>
          );
        })}
      </div>

      <div className="relative flex-1 overflow-y-auto px-4 py-4">
        {TABS.map(({ id }) => (
          <div
            aria-labelledby={`playground-tab-${id}`}
            hidden={id !== activeTab}
            id={`playground-panel-${id}`}
            key={id}
            role="tabpanel"
          >
            {panels[id]}
          </div>
        ))}
      </div>
    </aside>
  );
}
