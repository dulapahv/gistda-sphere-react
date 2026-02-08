"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import "./Sidebar.css";

interface SidebarProps {
  children: ReactNode;
}

/** Playground sidebar with header and scrollable content area. */
export function Sidebar({ children }: SidebarProps) {
  return (
    <div className="pg-sidebar">
      <div className="pg-sidebar-header">
        <div className="pg-sidebar-header-top">
          <div>
            <h1>GISTDA Sphere React</h1>
            <p>Interactive Playground</p>
          </div>
          <Link className="pg-docs-link" href="/docs" title="Back to docs">
            Docs
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>
      <div className="pg-sidebar-content">{children}</div>
    </div>
  );
}
