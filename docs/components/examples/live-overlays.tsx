"use client";

import {
  type PredefinedOverlay as OverlayType,
  PredefinedOverlay,
  SphereMap,
} from "gistda-sphere-react";
import { useState } from "react";

const OVERLAYS: { label: string; type: OverlayType }[] = [
  { label: "Traffic cameras", type: "cameras" },
  { label: "Road events", type: "events" },
  { label: "Air quality (AQI)", type: "aqi" },
];

/** Sphere's live overlays, each shown while its button is on. */
export function LiveOverlays() {
  const [active, setActive] = useState<OverlayType[]>(["cameras"]);

  const toggle = (type: OverlayType) => {
    setActive((previous) =>
      previous.includes(type)
        ? previous.filter((existing) => existing !== type)
        : [...previous, type]
    );
  };

  return (
    <>
      <SphereMap
        center={{ lat: 13.7563, lon: 100.5018 }}
        style={{ height: 350 }}
        zoom={11}
      >
        {active.map((type) => (
          <PredefinedOverlay key={type} type={type} />
        ))}
      </SphereMap>
      <div className="controls">
        {OVERLAYS.map(({ label, type }) => (
          <button
            aria-pressed={active.includes(type)}
            key={type}
            onClick={() => toggle(type)}
            type="button"
          >
            {label}
          </button>
        ))}
        <small>
          Live data from Sphere. Some overlays can be empty at times.
        </small>
      </div>
    </>
  );
}
