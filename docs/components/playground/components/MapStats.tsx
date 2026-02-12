"use client";

import type { Location } from "gistda-sphere-react";
import { getTranslations } from "../translations";

interface MapStatsProps {
  zoom: number;
  center: Location | null;
  totalShapes: number;
  lang: string;
}

export function MapStats({ zoom, center, totalShapes, lang }: MapStatsProps) {
  const t = getTranslations(lang);

  return (
    <div className="mb-4 rounded-lg border border-fd-border bg-fd-secondary px-4 py-2">
      <div className="flex items-center justify-between py-1">
        <span className="text-fd-secondary-foreground text-xs">{t.zoom}</span>
        <span className="font-medium text-fd-foreground text-xs tabular-nums">
          {zoom.toFixed(1)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-fd-secondary-foreground text-xs">{t.center}</span>
        <span className="font-medium text-fd-foreground text-xs tabular-nums">
          {center ? `${center.lat.toFixed(4)}, ${center.lon.toFixed(4)}` : "-"}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-fd-secondary-foreground text-xs">{t.shapes}</span>
        <span className="font-medium text-fd-foreground text-xs tabular-nums">
          {totalShapes}
        </span>
      </div>
    </div>
  );
}
