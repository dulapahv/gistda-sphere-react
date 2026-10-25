"use client";

import {
  Layer,
  SphereMap,
  type TilesetInfo,
  useMapControls,
} from "gistda-sphere-react";
import { useMemo, useState } from "react";

const EARTHQUAKES =
  "https://maplibre.org/maplibre-gl-js/docs/assets/earthquakes.geojson";
// Buildings from Cesium's 3D Tiles samples, in Pennsylvania, USA.
const BUILDINGS =
  "https://raw.githubusercontent.com/CesiumGS/3d-tiles-samples/main/1.0/TilesetWithRequestVolume/tileset.json";
const BOX_MODEL =
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb";

const HEATMAP_STYLE = {
  layers: [
    {
      id: "quakes-heat",
      paint: {
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 9, 3],
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 9, 20],
        "heatmap-weight": [
          "interpolate",
          ["linear"],
          ["get", "mag"],
          0,
          0,
          6,
          1,
        ],
      },
      source: "quakes-heat",
      type: "heatmap",
    },
  ],
  sources: { "quakes-heat": { data: EARTHQUAKES, type: "geojson" } },
};

const CLUSTER_STYLE = {
  layers: [
    {
      filter: ["has", "point_count"],
      id: "quakes-clusters",
      paint: {
        "circle-color": [
          "step",
          ["get", "point_count"],
          "#51bbd6",
          100,
          "#f1f075",
          750,
          "#f28cb1",
        ],
        "circle-radius": ["step", ["get", "point_count"], 14, 100, 22, 750, 32],
      },
      source: "quakes-clusters",
      type: "circle",
    },
    {
      filter: ["!", ["has", "point_count"]],
      id: "quakes-points",
      paint: { "circle-color": "#11b4da", "circle-radius": 5 },
      source: "quakes-clusters",
      type: "circle",
    },
  ],
  sources: {
    "quakes-clusters": {
      cluster: true,
      clusterRadius: 50,
      data: EARTHQUAKES,
      type: "geojson",
    },
  },
};

type Sample = "heatmap" | "clusters" | "buildings" | "model";
const SAMPLES: { label: string; sample: Sample }[] = [
  { label: "Heatmap", sample: "heatmap" },
  { label: "Clusters", sample: "clusters" },
  { label: "3D buildings (3D Tiles)", sample: "buildings" },
  { label: "3D model (glTF)", sample: "model" },
];

/** A glTF box in Bangkok, drawn by deck.gl's `ScenegraphLayer`. */
function ModelLayer() {
  const layer = useMemo(() => {
    // Sphere loads deck.gl, and it's on `window` once the map is ready.
    const { deck } = window;
    if (!deck) {
      return null;
    }
    return new deck.MapboxLayer({
      data: [{ position: [100.5018, 13.7563, 0] }],
      getPosition: (item: { position: number[] }) => item.position,
      getScale: [100, 100, 100],
      getTranslation: [0, 0, 50],
      id: "box-model",
      scenegraph: BOX_MODEL,
      type: deck.ScenegraphLayer,
    });
  }, []);
  return layer ? <Layer layer={layer} /> : null;
}

/** Heatmaps, clusters, 3D Tiles and a glTF model, all through `<Layer>`. */
export function AdvancedLayers() {
  const { goTo } = useMapControls();
  const [sample, setSample] = useState<Sample | null>(null);

  const flyToTileset = (tileset: TilesetInfo) => {
    const [lon, lat] = tileset.cartographicCenter ?? [];
    if (typeof lon === "number" && typeof lat === "number") {
      goTo({ center: { lat, lon }, pitch: 60, zoom: (tileset.zoom ?? 13) + 3 });
    }
  };

  const choose = (next: Sample) => {
    if (next === sample) {
      setSample(null);
      return;
    }
    setSample(next);
    if (next === "heatmap" || next === "clusters") {
      goTo({ center: { lat: 10, lon: 125 }, pitch: 0, zoom: 2.5 });
    } else if (next === "model") {
      goTo({ center: { lat: 13.7563, lon: 100.5018 }, pitch: 60, zoom: 16 });
    }
  };

  return (
    <>
      <SphereMap
        center={{ lat: 13.7563, lon: 100.5018 }}
        style={{ height: 400 }}
        zoom={5}
      >
        {sample === "heatmap" ? <Layer style={HEATMAP_STYLE} /> : null}
        {sample === "clusters" ? <Layer style={CLUSTER_STYLE} /> : null}
        {sample === "buildings" ? (
          <Layer
            name="buildings"
            onTilesetLoad={flyToTileset}
            type="Tiles3D"
            url={BUILDINGS}
          />
        ) : null}
        {sample === "model" ? <ModelLayer /> : null}
      </SphereMap>
      <div className="controls">
        {SAMPLES.map((option) => (
          <button
            aria-pressed={sample === option.sample}
            key={option.sample}
            onClick={() => choose(option.sample)}
            type="button"
          >
            {option.label}
          </button>
        ))}
        <small>
          Data: MapLibre (earthquakes), Cesium (3D Tiles), Khronos (glTF).
        </small>
      </div>
    </>
  );
}
