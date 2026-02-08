"use client";

import { SphereMap, SphereProvider, useMapControls } from "gistda-sphere-react";
import { useState } from "react";

const API_KEY = process.env.NEXT_PUBLIC_SPHERE_API_KEY ?? "";

const OVERLAYS = [
  { id: "cameras" as const, label: "CCTV Cameras" },
  { id: "events" as const, label: "Traffic Events" },
  { id: "aqi" as const, label: "Air Quality (AQI)" },
];

/** Inner controls for predefined overlay toggling. */
function PredefinedControls() {
  const { loadPredefinedOverlay, unloadPredefinedOverlay } = useMapControls();
  const [active, setActive] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        unloadPredefinedOverlay(
          id as Parameters<typeof unloadPredefinedOverlay>[0]
        );
      } else {
        next.add(id);
        loadPredefinedOverlay(
          id as Parameters<typeof loadPredefinedOverlay>[0]
        );
      }
      return next;
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-fd-border border-b bg-fd-card p-3">
        {OVERLAYS.map((o) => (
          <button
            className={`cursor-pointer rounded-md border px-3 py-1.5 text-[0.8125rem] disabled:cursor-not-allowed disabled:opacity-50 ${active.has(o.id) ? "border-fd-primary bg-fd-primary text-fd-primary-foreground" : "border-fd-border bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent"}`}
            key={o.id}
            onClick={() => toggle(o.id)}
            type="button"
          >
            {o.label}
          </button>
        ))}
      </div>
      <SphereMap
        center={{ lon: 100.5018, lat: 13.7563 }}
        language="en"
        style={{ width: "100%", height: "350px" }}
        zoom={10}
      />
    </>
  );
}

/** Interactive demo for predefined overlays (cameras, events, aqi). */
export function PredefinedOverlaysDemo() {
  if (!API_KEY) {
    return null;
  }

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-fd-border">
      <SphereProvider apiKey={API_KEY}>
        <PredefinedControls />
      </SphereProvider>
    </div>
  );
}
