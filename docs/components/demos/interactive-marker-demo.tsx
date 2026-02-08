"use client";

import {
  type Location,
  Marker,
  SphereMap,
  SphereProvider,
} from "gistda-sphere-react";
import { useState } from "react";

const API_KEY = process.env.NEXT_PUBLIC_SPHERE_API_KEY ?? "";

/** Interactive demo: click map to place markers. */
export function InteractiveMarkerDemo() {
  const [markers, setMarkers] = useState<Location[]>([]);

  if (!API_KEY) {
    return null;
  }

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-fd-border">
      <SphereProvider apiKey={API_KEY}>
        <SphereMap
          center={{ lon: 100.5018, lat: 13.7563 }}
          language="en"
          onClick={(location) => setMarkers((prev) => [...prev, location])}
          style={{ width: "100%", height: "400px" }}
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
          <span className="text-[0.8125rem] text-fd-muted-foreground">
            Click the map to place markers ({markers.length} placed)
          </span>
          <button
            className="ml-auto cursor-pointer rounded-md border border-fd-border bg-fd-secondary px-3 text-[0.8125rem] text-fd-secondary-foreground hover:bg-fd-accent disabled:cursor-not-allowed disabled:opacity-50"
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
