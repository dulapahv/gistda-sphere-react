"use client";

import type { Location } from "gistda-sphere-react";
import "./MapStats.css";

interface MapStatsProps {
  zoom: number;
  center: Location | null;
  totalShapes: number;
}

/** Displays current map zoom, center coordinates, and shape count. */
export function MapStats({ zoom, center, totalShapes }: MapStatsProps) {
  return (
    <div className="pg-stats-section">
      <div className="pg-stat-row">
        <span className="pg-stat-label">Zoom</span>
        <span className="pg-stat-value">{zoom.toFixed(1)}</span>
      </div>
      <div className="pg-stat-row">
        <span className="pg-stat-label">Center</span>
        <span className="pg-stat-value">
          {center ? `${center.lat.toFixed(4)}, ${center.lon.toFixed(4)}` : "-"}
        </span>
      </div>
      <div className="pg-stat-row">
        <span className="pg-stat-label">Shapes</span>
        <span className="pg-stat-value">{totalShapes}</span>
      </div>
    </div>
  );
}
