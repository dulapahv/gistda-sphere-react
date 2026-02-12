"use client";

import {
  type Location,
  SphereMap,
  SphereProvider,
  useMapControls,
} from "gistda-sphere-react";
import { useState } from "react";
import { useDocLanguage } from "./use-doc-language";

const API_KEY = process.env.NEXT_PUBLIC_SPHERE_API_KEY ?? "";

const cities: Array<{ name: string } & Location> = [
  { name: "Bangkok", lon: 100.5018, lat: 13.7563 },
  { name: "Chiang Mai", lon: 98.9853, lat: 18.7883 },
  { name: "Phuket", lon: 98.3923, lat: 7.8804 },
];

const filters = [
  "None",
  "Dark",
  "Light",
  "Protanopia",
  "Deuteranopia",
] as const;
const layers = ["STREETS", "HYBRID", "STREETS_NIGHT", "SIMPLE"] as const;

function Controls() {
  const { goTo, setFilter, setBaseLayer } = useMapControls();
  const [activeFilter, setActiveFilter] = useState("None");
  const [activeLayer, setActiveLayer] = useState("STREETS");

  return (
    <div className="flex flex-wrap items-center gap-2 bg-fd-card p-3">
      {cities.map((city) => (
        <button
          className="cursor-pointer rounded-md border border-fd-border bg-fd-secondary px-2 py-1.5 text-fd-secondary-foreground text-xs hover:bg-fd-accent disabled:cursor-not-allowed disabled:opacity-50"
          key={city.name}
          onClick={() => goTo({ center: city, zoom: 12 })}
          type="button"
        >
          {city.name}
        </button>
      ))}
      <select
        className="rounded-md border border-fd-border bg-fd-secondary px-2 py-1.5 text-fd-secondary-foreground text-xs"
        name="base-layer"
        onChange={(e) => {
          setActiveLayer(e.target.value);
          setBaseLayer(e.target.value as (typeof layers)[number]);
        }}
        value={activeLayer}
      >
        {layers.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
      <select
        className="rounded-md border border-fd-border bg-fd-secondary px-2 py-1.5 text-fd-secondary-foreground text-xs"
        name="filter"
        onChange={(e) => {
          setActiveFilter(e.target.value);
          setFilter(
            e.target.value === "None" ? false : (e.target.value as "Dark")
          );
        }}
        value={activeFilter}
      >
        {filters.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ControlsDemo() {
  const language = useDocLanguage();

  if (!API_KEY) {
    return null;
  }

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-fd-border">
      <SphereProvider apiKey={API_KEY}>
        <SphereMap
          center={{ lon: 100.5018, lat: 13.7563 }}
          language={language}
          style={{ width: "100%", height: "400px" }}
          zoom={10}
        />
        <Controls />
      </SphereProvider>
    </div>
  );
}
