"use client";

import { type BuiltInLayer, Layer, SphereMap } from "gistda-sphere-react";
import { useState } from "react";

const BASE_LAYERS: BuiltInLayer[] = [
  "STREETS",
  "HYBRID",
  "STREETS_NIGHT",
  "SIMPLE",
  "IMAGES",
];
const DATA_LAYERS: BuiltInLayer[] = [
  "TRAFFIC",
  "PM25",
  "HOTSPOT",
  "FLOOD",
  "DROUGHT",
];

/** The base map through the `baseLayer` prop, and data layers as `<Layer>` children. */
export function LayerPicker() {
  const [baseLayer, setBaseLayer] = useState<BuiltInLayer>("STREETS");
  const [dataLayers, setDataLayers] = useState<BuiltInLayer[]>([]);

  const toggle = (layer: BuiltInLayer) => {
    setDataLayers((previous) =>
      previous.includes(layer)
        ? previous.filter((existing) => existing !== layer)
        : [...previous, layer]
    );
  };

  return (
    <>
      <SphereMap
        baseLayer={baseLayer}
        center={{ lat: 13.7563, lon: 100.5018 }}
        style={{ height: 400 }}
        zoom={8}
      >
        {dataLayers.map((layer) => (
          <Layer key={layer} preset={layer} />
        ))}
      </SphereMap>
      <div className="controls">
        <small>Base map:</small>
        {BASE_LAYERS.map((layer) => (
          <button
            aria-pressed={baseLayer === layer}
            key={layer}
            onClick={() => setBaseLayer(layer)}
            type="button"
          >
            {layer}
          </button>
        ))}
      </div>
      <div className="controls">
        <small>Data layers:</small>
        {DATA_LAYERS.map((layer) => (
          <button
            aria-pressed={dataLayers.includes(layer)}
            key={layer}
            onClick={() => toggle(layer)}
            type="button"
          >
            {layer}
          </button>
        ))}
      </div>
    </>
  );
}
