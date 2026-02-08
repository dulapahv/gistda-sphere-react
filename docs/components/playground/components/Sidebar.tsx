"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface SidebarProps {
  children: ReactNode;
}

/** Playground sidebar with header and scrollable content area. */
export function Sidebar({ children }: SidebarProps) {
  return (
    <div className="flex h-full w-[340px] shrink-0 flex-col overflow-hidden border-fd-border border-r bg-fd-card text-fd-foreground max-md:h-[50vh] max-md:w-full max-md:border-fd-border max-md:border-r-0 max-md:border-b">
      <div className="shrink-0 border-fd-border border-b px-5 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="m-0 font-semibold text-fd-foreground text-sm tracking-tight">
              GISTDA Sphere React
            </h1>
            <p className="mt-0.5 text-fd-secondary-foreground text-xs">
              Interactive Playground
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-1 text-[11px] text-fd-secondary-foreground no-underline hover:text-fd-foreground"
            href="/docs"
            title="Back to docs"
          >
            Docs
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
    </div>
  );
}
