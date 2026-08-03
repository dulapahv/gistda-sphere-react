"use client";

import {
  type Location,
  Marker,
  SphereMap,
  SphereProvider,
} from "gistda-sphere-react";
import { useState } from "react";
import { useDocLanguage } from "./use-doc-language";

const API_KEY = process.env.NEXT_PUBLIC_SPHERE_API_KEY ?? "";

export function InteractiveMarkerDemo() {
  const [markers, setMarkers] = useState<Location[]>([]);
  const language = useDocLanguage();

  if (!API_KEY) {
    return null;
  }

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-fd-border">
      <SphereProvider apiKey={API_KEY}>
        <SphereMap
          center={{ lat: 13.7563, lon: 100.5018 }}
          language={language}
          onClick={(location) => setMarkers((prev) => [...prev, location])}
          style={{ height: "400px", width: "100%" }}
          zoom={10}
        >
          {markers.map((pos) => (
            <Marker
              key={`${pos.lon}-${pos.lat}`}
              position={pos}
              title={`${pos.lat.toFixed(4)}, ${pos.lon.toFixed(4)}`}
            />
          ))}
        </SphereMap>
        <div className="flex flex-wrap items-center gap-2 bg-fd-card p-3">
          <span className="py-2 text-fd-muted-foreground text-sm">
            Click the map to place markers ({markers.length} placed)
          </span>
          <button
            className="ml-auto cursor-pointer rounded-md border border-fd-border bg-fd-secondary px-2 py-1.5 text-fd-secondary-foreground text-xs hover:bg-fd-accent disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setMarkers([])}
            type="button"
          >
            Clear
          </button>
        </div>
      </SphereProvider>
    </div>
  );
}
