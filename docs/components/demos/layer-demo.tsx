"use client";

import { type BuiltInLayer, Layer, SphereMap } from "gistda-sphere-react";
import { useState } from "react";
import {
  DemoBar,
  DemoButton,
  DemoFrame,
  DemoNote,
  useDemoText,
} from "./demo-ui";
import { useDocLanguage } from "./use-doc-language";

const BASE_LAYERS: readonly BuiltInLayer[] = [
  "STREETS",
  "HYBRID",
  "STREETS_NIGHT",
  "SIMPLE",
  "IMAGES",
];
const DATA_LAYERS: readonly BuiltInLayer[] = [
  "TRAFFIC",
  "PM25",
  "HOTSPOT",
  "FLOOD",
  "DROUGHT",
];

const TEXT = {
  en: { base: "Base map:", data: "Data layers:" },
  th: { base: "แผนที่ฐาน:", data: "ชั้นข้อมูล:" },
};

/** Base map via the `baseLayer` prop and data layers as `<Layer>` children. */
function Layers() {
  const language = useDocLanguage();
  const text = useDemoText(TEXT);
  const [baseLayer, setBaseLayer] = useState<BuiltInLayer>("STREETS");
  const [dataLayers, setDataLayers] = useState<BuiltInLayer[]>([]);

  const toggle = (layer: BuiltInLayer) =>
    setDataLayers((previous) =>
      previous.includes(layer)
        ? previous.filter((existing) => existing !== layer)
        : [...previous, layer]
    );

  return (
    <>
      <SphereMap
        baseLayer={baseLayer}
        center={{ lat: 13.7563, lon: 100.5018 }}
        language={language}
        style={{ height: "400px", width: "100%" }}
        zoom={8}
      >
        {dataLayers.map((layer) => (
          <Layer key={layer} preset={layer} />
        ))}
      </SphereMap>
      <DemoBar>
        <DemoNote>{text.base}</DemoNote>
        {BASE_LAYERS.map((layer) => (
          <DemoButton
            active={baseLayer === layer}
            key={layer}
            onClick={() => setBaseLayer(layer)}
          >
            {layer}
          </DemoButton>
        ))}
      </DemoBar>
      <DemoBar>
        <DemoNote>{text.data}</DemoNote>
        {DATA_LAYERS.map((layer) => (
          <DemoButton
            active={dataLayers.includes(layer)}
            key={layer}
            onClick={() => toggle(layer)}
          >
            {layer}
          </DemoButton>
        ))}
      </DemoBar>
    </>
  );
}

export function LayerDemo() {
  return (
    <DemoFrame height="520px">
      <Layers />
    </DemoFrame>
  );
}
