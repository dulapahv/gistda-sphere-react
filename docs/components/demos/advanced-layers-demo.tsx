"use client";

import {
  Layer,
  SphereMap,
  type TilesetInfo,
  useMapControls,
} from "gistda-sphere-react";
import { useCallback, useMemo, useState } from "react";
import {
  DemoBar,
  DemoButton,
  DemoFrame,
  DemoNote,
  useDemoText,
} from "./demo-ui";
import { useDocLanguage } from "./use-doc-language";

const EARTHQUAKES =
  "https://maplibre.org/maplibre-gl-js/docs/assets/earthquakes.geojson";
const I3S_BUILDINGS =
  "https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/SanFrancisco_Bldgs/SceneServer/layers/0";
const BOX_MODEL =
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb";

type Sample = "heatmap" | "clusters" | "buildings" | "model";
const SAMPLES: readonly Sample[] = [
  "heatmap",
  "clusters",
  "buildings",
  "model",
];

const TEXT = {
  en: {
    credits:
      "Data: MapLibre (earthquakes), Esri (San Francisco), Khronos (glTF).",
    samples: {
      buildings: "3D buildings (I3S)",
      clusters: "Clusters",
      heatmap: "Heatmap",
      model: "3D model (glTF)",
    },
  },
  th: {
    credits: "ข้อมูล: MapLibre (แผ่นดินไหว), Esri (ซานฟรานซิสโก), Khronos (glTF)",
    samples: {
      buildings: "อาคาร 3 มิติ (I3S)",
      clusters: "จัดกลุ่มจุด",
      heatmap: "แผนที่ความร้อน",
      model: "โมเดล 3 มิติ (glTF)",
    },
  },
};

const HEATMAP_STYLE = {
  layers: [
    {
      id: "demo-heatmap",
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
      source: "demo-heatmap",
      type: "heatmap",
    },
  ],
  sources: { "demo-heatmap": { data: EARTHQUAKES, type: "geojson" } },
};

const CLUSTER_STYLE = {
  layers: [
    {
      filter: ["has", "point_count"],
      id: "demo-clusters",
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
      source: "demo-clusters",
      type: "circle",
    },
    {
      filter: ["!", ["has", "point_count"]],
      id: "demo-cluster-points",
      paint: { "circle-color": "#11b4da", "circle-radius": 5 },
      source: "demo-clusters",
      type: "circle",
    },
  ],
  sources: {
    "demo-clusters": {
      cluster: true,
      clusterRadius: 50,
      data: EARTHQUAKES,
      type: "geojson",
    },
  },
};

interface DeckGlobal {
  MapboxLayer?: new (props: Record<string, unknown>) => object;
  ScenegraphLayer?: unknown;
}

/** A glTF box in Bangkok, as in Sphere's 3D model example. */
function ModelLayer() {
  const layer = useMemo(() => {
    const { deck } = window as { deck?: DeckGlobal };
    if (!(deck?.MapboxLayer && deck.ScenegraphLayer)) {
      return null;
    }
    return new deck.MapboxLayer({
      data: [{ position: [100.5018, 13.7563, 0] }],
      getPosition: (item: { position: number[] }) => item.position,
      getScale: [100, 100, 100],
      getTranslation: [0, 0, 50],
      id: "demo-model",
      scenegraph: BOX_MODEL,
      type: deck.ScenegraphLayer,
    });
  }, []);
  return layer ? <Layer layer={layer} /> : null;
}

/** Heatmap, clusters, I3S buildings and a glTF model through `<Layer>`. */
function AdvancedLayers() {
  const language = useDocLanguage();
  const text = useDemoText(TEXT);
  const { goTo } = useMapControls();
  const [sample, setSample] = useState<Sample | null>(null);

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

  const choose = (next: Sample) => {
    const turningOff = next === sample;
    setSample(turningOff ? null : next);
    if (turningOff) {
      return;
    }
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
        language={language}
        style={{ height: "400px", width: "100%" }}
        zoom={5}
      >
        {sample === "heatmap" ? <Layer style={HEATMAP_STYLE} /> : null}
        {sample === "clusters" ? <Layer style={CLUSTER_STYLE} /> : null}
        {sample === "buildings" ? (
          <Layer
            name="demo-buildings"
            onTilesetLoad={flyToTileset}
            type="I3S"
            url={I3S_BUILDINGS}
          />
        ) : null}
        {sample === "model" ? <ModelLayer /> : null}
      </SphereMap>
      <DemoBar>
        {SAMPLES.map((option) => (
          <DemoButton
            active={sample === option}
            key={option}
            onClick={() => choose(option)}
          >
            {text.samples[option]}
          </DemoButton>
        ))}
        <DemoNote>{text.credits}</DemoNote>
      </DemoBar>
    </>
  );
}

export function AdvancedLayersDemo() {
  return (
    <DemoFrame height="460px">
      <AdvancedLayers />
    </DemoFrame>
  );
}
