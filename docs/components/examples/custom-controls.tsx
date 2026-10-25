"use client";

import {
  type BuiltInLayer,
  MapControl,
  MenuBar,
  SphereMap,
  useMapControls,
} from "gistda-sphere-react";
import { useState } from "react";

const BANGKOK = { lat: 13.7563, lon: 100.5018 };
const BASE_MAPS = [
  { label: "Streets", value: "STREETS" },
  { label: "Hybrid", value: "HYBRID" },
  { label: "Night", value: "STREETS_NIGHT" },
];

/** React buttons shown as a native map control. */
function HomeControl() {
  const { goTo, setRotate } = useMapControls();
  return (
    <MapControl group position="top-left">
      <button
        aria-label="Back to Bangkok"
        onClick={() => goTo({ center: BANGKOK, zoom: 11 })}
        title="Back to Bangkok"
        type="button"
      >
        ⌂
      </button>
      <button
        aria-label="Face north"
        onClick={() => setRotate(0)}
        title="Face north"
        type="button"
      >
        N
      </button>
    </MapControl>
  );
}

/** A `<MapControl>` and a `<MenuBar>` on one map. */
export function CustomControls() {
  const [baseLayer, setBaseLayer] = useState<BuiltInLayer>("STREETS");

  return (
    <>
      <SphereMap
        baseLayer={baseLayer}
        center={BANGKOK}
        style={{ height: 400 }}
        zoom={11}
      >
        <HomeControl />
        <MenuBar
          items={BASE_MAPS}
          onChange={(item) => setBaseLayer(item.value as BuiltInLayer)}
          position="bottom-left"
          selectedIndex={0}
        />
      </SphereMap>
      <div className="controls">
        <output>Base map from the menu bar: {baseLayer}</output>
      </div>
    </>
  );
}
