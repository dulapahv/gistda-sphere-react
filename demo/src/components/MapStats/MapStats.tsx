import type { Location } from "gistda-sphere-react";
import "./MapStats.css";

interface MapStatsProps {
  zoom: number;
  center: Location | null;
  totalShapes: number;
}

export function MapStats({ zoom, center, totalShapes }: MapStatsProps) {
  return (
    <div className="stats-section">
      <div className="stat-row">
        <span className="stat-label">Zoom</span>
        <span className="stat-value">{zoom.toFixed(1)}</span>
      </div>
      <div className="stat-row">
        <span className="stat-label">Center</span>
        <span className="stat-value">
          {center ? `${center.lat.toFixed(4)}, ${center.lon.toFixed(4)}` : "-"}
        </span>
      </div>
      <div className="stat-row">
        <span className="stat-label">Shapes</span>
        <span className="stat-value">{totalShapes}</span>
      </div>
    </div>
  );
}
