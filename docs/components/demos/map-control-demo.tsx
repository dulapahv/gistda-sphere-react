"use client";

import {
  type BuiltInLayer,
  MapControl,
  MenuBar,
  type MenuItem,
  SphereMap,
  useMapControls,
} from "gistda-sphere-react";
import { useState } from "react";
import { DemoBar, DemoFrame, DemoNote, useDemoText } from "./demo-ui";
import { useDocLanguage } from "./use-doc-language";

const BANGKOK = { lat: 13.7563, lon: 100.5018 };

const TEXT = {
  en: {
    base: (layer: string) => `Base map from <MenuBar>: ${layer}`,
    home: "Back to Bangkok",
    items: [
      { label: "Streets", value: "STREETS" },
      { label: "Hybrid", value: "HYBRID" },
      { label: "Night", value: "STREETS_NIGHT" },
    ],
    north: "Face north",
  },
  th: {
    base: (layer: string) => `แผนที่ฐานจาก <MenuBar>: ${layer}`,
    home: "กลับกรุงเทพฯ",
    items: [
      { label: "ถนน", value: "STREETS" },
      { label: "ไฮบริด", value: "HYBRID" },
      { label: "กลางคืน", value: "STREETS_NIGHT" },
    ],
    north: "หันทิศเหนือ",
  },
};

const CONTROL_BUTTON =
  "flex! items-center justify-center font-bold text-[#333] text-base";

/** React buttons rendered as a native map control. */
function HomeControl() {
  const text = useDemoText(TEXT);
  const { goTo, setRotate } = useMapControls();
  return (
    <MapControl group position="top-left">
      <button
        aria-label={text.home}
        className={CONTROL_BUTTON}
        onClick={() => goTo({ center: BANGKOK, zoom: 11 })}
        title={text.home}
        type="button"
      >
        ⌂
      </button>
      <button
        aria-label={text.north}
        className={CONTROL_BUTTON}
        onClick={() => setRotate(0)}
        title={text.north}
        type="button"
      >
        N
      </button>
    </MapControl>
  );
}

/** `<MapControl>` and `<MenuBar>` on one map. */
function ControlsMap() {
  const language = useDocLanguage();
  const text = useDemoText(TEXT);
  const [baseLayer, setBaseLayer] = useState<BuiltInLayer>("STREETS");
  const items: MenuItem[] = text.items;

  return (
    <>
      <SphereMap
        baseLayer={baseLayer}
        center={BANGKOK}
        language={language}
        style={{ height: "400px", width: "100%" }}
        zoom={11}
      >
        <HomeControl />
        <MenuBar
          items={items}
          onChange={(item) => setBaseLayer(item.value as BuiltInLayer)}
          position="bottom-left"
          selectedIndex={0}
        />
      </SphereMap>
      <DemoBar>
        <DemoNote>{text.base(baseLayer)}</DemoNote>
      </DemoBar>
    </>
  );
}

export function MapControlDemo() {
  return (
    <DemoFrame height="450px">
      <ControlsMap />
    </DemoFrame>
  );
}
