import type { Location } from "gistda-sphere-react";
import { LOCATIONS } from "../../constants";
import "./QuickNav.css";

interface QuickNavProps {
  onNavigate: (location: Location, zoom?: number) => void;
}

export function QuickNav({ onNavigate }: QuickNavProps) {
  return (
    <div className="panel-section">
      <div className="section-header">Quick Navigation</div>
      <div className="quick-nav">
        {Object.entries(LOCATIONS).map(([name, loc]) => (
          <button
            className="nav-btn"
            key={name}
            onClick={() => onNavigate(loc)}
            type="button"
          >
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
