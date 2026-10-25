"use client";

import {
  type BuiltInLayer,
  type FilterType,
  SphereMap,
  useMapControls,
} from "gistda-sphere-react";
import { useState } from "react";

const BANGKOK = { lat: 13.7563, lon: 100.5018 };
const CITIES = [
  { center: BANGKOK, name: "Bangkok" },
  { center: { lat: 18.7883, lon: 98.9853 }, name: "Chiang Mai" },
  { center: { lat: 7.8804, lon: 98.3923 }, name: "Phuket" },
];
const BASE_LAYERS: BuiltInLayer[] = [
  "STREETS",
  "HYBRID",
  "STREETS_NIGHT",
  "SIMPLE",
];
const FILTERS: FilterType[] = [
  "None",
  "Dark",
  "Light",
  "Protanopia",
  "Deuteranopia",
];

/** Buttons outside the map that move it and change its look. */
export function ControlPanel() {
  const {
    getPitch,
    getRotate,
    goTo,
    setBaseLayer,
    setFilter,
    setPitch,
    setRotate,
  } = useMapControls();
  const [baseLayer, setBaseLayerName] = useState<BuiltInLayer>("STREETS");
  const [filter, setFilterName] = useState<FilterType>("None");

  return (
    <>
      <SphereMap center={BANGKOK} style={{ height: 400 }} zoom={10} />
      <div className="controls">
        {CITIES.map((city) => (
          <button
            key={city.name}
            onClick={() => goTo({ center: city.center, zoom: 12 })}
            type="button"
          >
            {city.name}
          </button>
        ))}
        <button
          onClick={() => setRotate(((getRotate() ?? 0) + 45) % 360)}
          type="button"
        >
          Rotate 45°
        </button>
        <button
          onClick={() => setPitch((getPitch() ?? 0) > 0 ? 0 : 50)}
          type="button"
        >
          Tilt
        </button>
        <label>
          Base map
          <select
            onChange={(event) => {
              const layer = event.target.value as BuiltInLayer;
              setBaseLayerName(layer);
              setBaseLayer(layer);
            }}
            value={baseLayer}
          >
            {BASE_LAYERS.map((layer) => (
              <option key={layer}>{layer}</option>
            ))}
          </select>
        </label>
        <label>
          Color filter
          <select
            onChange={(event) => {
              const next = event.target.value as FilterType;
              setFilterName(next);
              setFilter(next);
            }}
            value={filter}
          >
            {FILTERS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>
    </>
  );
}
