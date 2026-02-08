"use client";

import { SphereMap, SphereProvider, useMapControls } from "gistda-sphere-react";
import { useState } from "react";

const API_KEY = process.env.NEXT_PUBLIC_SPHERE_API_KEY ?? "";

const baseLayers = [
  "STREETS",
  "HYBRID",
  "STREETS_NIGHT",
  "SIMPLE",
  "IMAGES",
] as const;
const dataLayers = ["TRAFFIC", "PM25", "HOTSPOT", "FLOOD", "DROUGHT"] as const;

/** Inner layer controls that use map hooks. */
function LayerControls() {
  const { setBaseLayer, addLayer, removeLayer } = useMapControls();
  const [activeBase, setActiveBase] = useState("STREETS");
  const [activeData, setActiveData] = useState<Set<string>>(new Set());

  const toggleData = (layer: string) => {
    setActiveData((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) {
        next.delete(layer);
        removeLayer(layer as (typeof dataLayers)[number]);
      } else {
        next.add(layer);
        addLayer(layer as (typeof dataLayers)[number]);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-2 bg-fd-card p-3">
      <div className="flex flex-wrap gap-1.5">
        <span className="mb-0.5 w-full text-fd-muted-foreground text-xs">
          Base Layer
        </span>
        {baseLayers.map((l) => (
          <button
            className={`cursor-pointer rounded-md border px-2 py-0.5 text-xs disabled:cursor-not-allowed disabled:opacity-50 ${activeBase === l ? "border-fd-primary bg-fd-primary text-fd-primary-foreground" : "border-fd-border bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent"}`}
            key={l}
            onClick={() => {
              setActiveBase(l);
              setBaseLayer(l);
            }}
            type="button"
          >
            {l}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className="mb-0.5 w-full text-fd-muted-foreground text-xs">
          Data Layers
        </span>
        {dataLayers.map((l) => (
          <button
            className={`cursor-pointer rounded-md border px-2 py-0.5 text-xs disabled:cursor-not-allowed disabled:opacity-50 ${activeData.has(l) ? "border-fd-primary bg-fd-primary text-fd-primary-foreground" : "border-fd-border bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent"}`}
            key={l}
            onClick={() => toggleData(l)}
            type="button"
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Interactive demo for Layer component and built-in layers. */
export function LayerDemo() {
  if (!API_KEY) {
    return null;
  }

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-fd-border">
      <SphereProvider apiKey={API_KEY}>
        <SphereMap
          center={{ lon: 100.5018, lat: 13.7563 }}
          language="en"
          style={{ width: "100%", height: "400px" }}
          zoom={8}
        />
        <LayerControls />
      </SphereProvider>
    </div>
  );
}
