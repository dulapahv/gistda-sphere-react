"use client";

import {
  type BuiltInLayer,
  type FilterType,
  type Location,
  SphereMap,
  useMapControls,
} from "gistda-sphere-react";
import { useState } from "react";
import { DemoBar, DemoButton, DemoFrame, useDemoText } from "./demo-ui";
import { useDocLanguage } from "./use-doc-language";

const CITIES: Array<{ id: "bangkok" | "chiangMai" | "phuket" } & Location> = [
  { id: "bangkok", lat: 13.7563, lon: 100.5018 },
  { id: "chiangMai", lat: 18.7883, lon: 98.9853 },
  { id: "phuket", lat: 7.8804, lon: 98.3923 },
];

const FILTERS: readonly FilterType[] = [
  "None",
  "Dark",
  "Light",
  "Protanopia",
  "Deuteranopia",
];
const LAYERS: readonly BuiltInLayer[] = [
  "STREETS",
  "HYBRID",
  "STREETS_NIGHT",
  "SIMPLE",
];

const TEXT = {
  en: {
    baseLayer: "Base map",
    cities: { bangkok: "Bangkok", chiangMai: "Chiang Mai", phuket: "Phuket" },
    filter: "Color filter",
    rotate: "Rotate 45°",
    tilt: "Tilt",
  },
  th: {
    baseLayer: "แผนที่ฐาน",
    cities: { bangkok: "กรุงเทพฯ", chiangMai: "เชียงใหม่", phuket: "ภูเก็ต" },
    filter: "ตัวกรองสี",
    rotate: "หมุน 45°",
    tilt: "เอียง",
  },
};

const SELECT =
  "rounded-md border border-fd-border bg-fd-secondary px-2 py-1.5 text-fd-secondary-foreground text-xs";

/** Imperative map control with `useMapControls`. */
function Controls() {
  const text = useDemoText(TEXT);
  const {
    goTo,
    getPitch,
    getRotate,
    setBaseLayer,
    setFilter,
    setPitch,
    setRotate,
  } = useMapControls();
  const [filter, setFilterState] = useState<FilterType>("None");
  const [layer, setLayer] = useState<BuiltInLayer>("STREETS");

  return (
    <DemoBar>
      {CITIES.map((city) => (
        <DemoButton
          key={city.id}
          onClick={() => goTo({ center: city, zoom: 12 })}
        >
          {text.cities[city.id]}
        </DemoButton>
      ))}
      <DemoButton onClick={() => setRotate(((getRotate() ?? 0) + 45) % 360)}>
        {text.rotate}
      </DemoButton>
      <DemoButton onClick={() => setPitch((getPitch() ?? 0) > 0 ? 0 : 50)}>
        {text.tilt}
      </DemoButton>
      <label className="flex items-center gap-1 text-fd-muted-foreground text-xs">
        {text.baseLayer}
        <select
          className={SELECT}
          onChange={(event) => {
            const next = event.target.value as BuiltInLayer;
            setLayer(next);
            setBaseLayer(next);
          }}
          value={layer}
        >
          {LAYERS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-1 text-fd-muted-foreground text-xs">
        {text.filter}
        <select
          className={SELECT}
          onChange={(event) => {
            const next = event.target.value as FilterType;
            setFilterState(next);
            setFilter(next);
          }}
          value={filter}
        >
          {FILTERS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </DemoBar>
  );
}

export function ControlsDemo() {
  const language = useDocLanguage();
  return (
    <DemoFrame height="460px">
      <SphereMap
        center={{ lat: 13.7563, lon: 100.5018 }}
        language={language}
        style={{ height: "400px", width: "100%" }}
        zoom={10}
      />
      <Controls />
    </DemoFrame>
  );
}
