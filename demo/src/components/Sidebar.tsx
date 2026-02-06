import type { ReactNode } from "react";
import "./Sidebar.css";

interface SidebarProps {
  children: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>GISTDA Sphere React</h1>
        <p>Interactive Map Demo</p>
        <p className="unofficial-notice">Unofficial community project</p>
      </div>
      <div className="sidebar-content">{children}</div>
    </div>
  );
}
