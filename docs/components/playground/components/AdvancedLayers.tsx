"use client";

import { Layer, type TilesetInfo, useMapControls } from "gistda-sphere-react";
import { useCallback, useMemo } from "react";
import type { AdvancedLayer } from "../constants";

const EARTHQUAKES_URL =
  "https://maplibre.org/maplibre-gl-js/docs/assets/earthquakes.geojson";
const I3S_BUILDINGS_URL =
  "https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/SanFrancisco_Bldgs/SceneServer/layers/0";
const POINT_CLOUD_URL =
  "https://webodm.longdo.com/api/projects/2/tasks/430d3956-ddde-47c1-9ae5-256870076657/assets/3d_tiles/pointcloud/tileset.json";
const MODEL_URL =
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb";
const WMS_URL = "https://ms.longdo.com/mapproxy/service";

/** Where the 3D model is placed. */
export const MODEL_POSITION = { lat: 13.7, lon: 100.5 };

/** A heatmap of earthquakes, as a MapLibre style with its own source. */
const HEATMAP_STYLE = {
  layers: [
    {
      id: "playground-heatmap",
      paint: {
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(33,102,172,0)",
          0.2,
          "rgb(103,169,207)",
          0.4,
          "rgb(209,229,240)",
          0.6,
          "rgb(253,219,199)",
          0.8,
          "rgb(239,138,98)",
          1,
          "rgb(178,24,43)",
        ],
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 9, 3],
        "heatmap-opacity": 0.85,
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
      source: "playground-heatmap",
      type: "heatmap",
    },
  ],
  sources: {
    "playground-heatmap": { data: EARTHQUAKES_URL, type: "geojson" },
  },
};

/** Clustered earthquakes: circles sized by how many points they hold. */
const CLUSTER_STYLE = {
  layers: [
    {
      filter: ["has", "point_count"],
      id: "playground-clusters",
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
        "circle-opacity": 0.85,
        "circle-radius": ["step", ["get", "point_count"], 14, 100, 22, 750, 32],
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 1.5,
      },
      source: "playground-clusters",
      type: "circle",
    },
    {
      filter: ["!", ["has", "point_count"]],
      id: "playground-cluster-points",
      paint: {
        "circle-color": "#11b4da",
        "circle-radius": 5,
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 1,
      },
      source: "playground-clusters",
      type: "circle",
    },
  ],
  sources: {
    "playground-clusters": {
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
      data: EARTHQUAKES_URL,
      type: "geojson",
    },
  },
};

/** The parts of the deck.gl global (loaded by Sphere) used here. */
interface DeckGlobal {
  MapboxLayer?: new (props: Record<string, unknown>) => object;
  ScenegraphLayer?: unknown;
}

/** Creates a deck.gl glTF model layer, as in Sphere's 3D model example. */
function createModelLayer(): object | null {
  const { deck } = window as { deck?: DeckGlobal };
  if (!(deck?.MapboxLayer && deck.ScenegraphLayer)) {
    return null;
  }
  const scale = 100;
  return new deck.MapboxLayer({
    _lighting: "pbr",
    data: [
      {
        color: [255, 64, 64, 255],
        coordinates: [MODEL_POSITION.lon, MODEL_POSITION.lat, 0],
        scale: [scale, scale, scale],
        translation: [0, 0, scale / 2],
      },
    ],
    getColor: (item: { color: number[] }) => item.color,
    getPosition: (item: { coordinates: number[] }) => item.coordinates,
    getScale: (item: { scale: number[] }) => item.scale,
    getTranslation: (item: { translation: number[] }) => item.translation,
    id: "playground-model",
    opacity: 0.8,
    scenegraph: MODEL_URL,
    type: deck.ScenegraphLayer,
  });
}

/** The glTF model layer, if deck.gl's scenegraph layer is available. */
function ModelLayer() {
  const layer = useMemo(createModelLayer, []);
  return layer ? <Layer layer={layer} /> : null;
}

/** Renders the advanced layers that are switched on. */
export function AdvancedLayers({ layers }: { layers: AdvancedLayer[] }) {
  const { goTo } = useMapControls();

  // 3D tilesets report their center once loaded; fly there with a tilt.
  const flyToTileset = useCallback(
    (tileset: TilesetInfo) => {
      const [lon, lat] = tileset.cartographicCenter ?? [];
      if (typeof lon === "number" && typeof lat === "number") {
        goTo({
          center: { lat, lon },
          pitch: 60,
          zoom: (tileset.zoom ?? 13) + 3,
        });
      }
    },
    [goTo]
  );

  return (
    <>
      {layers.includes("heatmap") ? <Layer style={HEATMAP_STYLE} /> : null}
      {layers.includes("clusters") ? <Layer style={CLUSTER_STYLE} /> : null}
      {layers.includes("wms") ? (
        <Layer
          format="image/png"
          name="bluemarble_terrain"
          opacity={0.7}
          type="WMS"
          url={WMS_URL}
        />
      ) : null}
      {layers.includes("buildings3d") ? (
        <Layer
          name="playground-buildings"
          onTilesetLoad={flyToTileset}
          type="I3S"
          url={I3S_BUILDINGS_URL}
        />
      ) : null}
      {layers.includes("pointcloud") ? (
        <Layer
          name="playground-pointcloud"
          onTilesetLoad={flyToTileset}
          pointSize={2}
          type="Tiles3D"
          url={POINT_CLOUD_URL}
        />
      ) : null}
      {layers.includes("model3d") ? <ModelLayer /> : null}
    </>
  );
}
