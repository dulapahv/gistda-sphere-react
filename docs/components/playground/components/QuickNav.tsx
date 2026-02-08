"use client";

import type { Location } from "gistda-sphere-react";
import { LOCATIONS } from "../constants";
import "./QuickNav.css";

interface QuickNavProps {
  onNavigate: (location: Location, zoom?: number) => void;
}

/** Quick navigation buttons for common Thai cities. */
export function QuickNav({ onNavigate }: QuickNavProps) {
  return (
    <div className="pg-panel-section">
      <div className="pg-section-header">Quick Navigation</div>
      <div className="pg-quick-nav">
        {Object.entries(LOCATIONS).map(([name, loc]) => (
          <button
            className="pg-nav-btn"
            key={name}
            onClick={() => onNavigate(loc)}
            type="button"
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
