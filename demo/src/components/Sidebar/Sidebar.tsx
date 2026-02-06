import { Github } from "lucide-react";
import type { ReactNode } from "react";
import "./Sidebar.css";

interface SidebarProps {
  children: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-header-top">
          <div>
            <h1>GISTDA Sphere React</h1>
            <p>Interactive Map Demo</p>
            <p className="unofficial-notice">Unofficial community project</p>
          </div>
          <a
            aria-label="View on GitHub"
            className="github-link"
            href="https://github.com/dulapahv/gistda-sphere-react"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Github size={20} />
          </a>
        </div>
      </div>
      <div className="sidebar-content">{children}</div>
    </div>
  );
}
