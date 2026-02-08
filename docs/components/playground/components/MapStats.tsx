"use client";

import type { Location } from "gistda-sphere-react";

interface MapStatsProps {
  zoom: number;
  center: Location | null;
  totalShapes: number;
}

/** Displays current map zoom, center coordinates, and shape count. */
export function MapStats({ zoom, center, totalShapes }: MapStatsProps) {
  return (
    <div className="mb-4 rounded-lg border border-fd-border bg-fd-secondary px-4 py-2">
      <div className="flex items-center justify-between py-1">
        <span className="text-fd-secondary-foreground text-xs">Zoom</span>
        <span className="font-medium text-fd-foreground text-xs tabular-nums">
          {zoom.toFixed(1)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-fd-secondary-foreground text-xs">Center</span>
        <span className="font-medium text-fd-foreground text-xs tabular-nums">
          {center ? `${center.lat.toFixed(4)}, ${center.lon.toFixed(4)}` : "-"}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-fd-secondary-foreground text-xs">Shapes</span>
        <span className="font-medium text-fd-foreground text-xs tabular-nums">
          {totalShapes}
        </span>
      </div>
    </div>
  );
}
