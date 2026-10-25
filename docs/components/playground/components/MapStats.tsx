"use client";

import { useCamera } from "../hooks";
import type { PlaygroundTranslations } from "../translations";
import { formatLocation } from "./MapCards";

/** Live camera readout at the top of the sidebar. */
export function MapStats({ t }: { t: PlaygroundTranslations }) {
  const camera = useCamera();

  const angles: [label: string, value: string][] = [
    [t.stats.zoom, camera ? camera.zoom.toFixed(1) : "–"],
    [t.stats.rotation, camera ? `${Math.round(camera.rotation)}°` : "–"],
    [t.stats.pitch, camera ? `${Math.round(camera.pitch)}°` : "–"],
  ];

  return (
    <div className="rounded-lg border border-fd-border bg-fd-secondary px-3 py-2 text-xs tabular-nums">
      <div className="flex justify-between gap-2">
        {angles.map(([label, value]) => (
          <span key={label}>
            <span className="text-fd-muted-foreground">{label} </span>
            <span className="font-medium text-fd-foreground">{value}</span>
          </span>
        ))}
      </div>
      <div className="mt-1 flex justify-between gap-2">
        <span className="text-fd-muted-foreground">{t.stats.center}</span>
        <span className="font-medium text-fd-foreground">
          {camera ? formatLocation(camera.center, 4) : "–"}
        </span>
      </div>
    </div>
  );
}
