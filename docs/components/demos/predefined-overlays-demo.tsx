"use client";

import {
  PredefinedOverlay,
  type PredefinedOverlay as PredefinedOverlayName,
  SphereMap,
} from "gistda-sphere-react";
import { useState } from "react";
import {
  DemoBar,
  DemoButton,
  DemoFrame,
  DemoNote,
  useDemoText,
} from "./demo-ui";
import { useDocLanguage } from "./use-doc-language";

const OVERLAYS: readonly PredefinedOverlayName[] = ["cameras", "events", "aqi"];

const TEXT = {
  en: {
    hint: "Live data from Sphere; some overlays can be empty at times.",
    overlays: {
      aqi: "Air quality (AQI)",
      cameras: "Traffic cameras",
      events: "Road events",
    },
  },
  th: {
    hint: "ข้อมูลสดจาก Sphere บางช่วงเวลาอาจไม่มีข้อมูล",
    overlays: {
      aqi: "คุณภาพอากาศ (AQI)",
      cameras: "กล้องจราจร",
      events: "เหตุการณ์บนถนน",
    },
  },
};

/** Live overlays shown with `<PredefinedOverlay>` while toggled on. */
function LiveOverlays() {
  const language = useDocLanguage();
  const text = useDemoText(TEXT);
  const [active, setActive] = useState<PredefinedOverlayName[]>(["cameras"]);

  const toggle = (overlay: PredefinedOverlayName) =>
    setActive((previous) =>
      previous.includes(overlay)
        ? previous.filter((existing) => existing !== overlay)
        : [...previous, overlay]
    );

  return (
    <>
      <SphereMap
        center={{ lat: 13.7563, lon: 100.5018 }}
        language={language}
        style={{ height: "350px", width: "100%" }}
        zoom={11}
      >
        {active.map((overlay) => (
          <PredefinedOverlay key={overlay} type={overlay} />
        ))}
      </SphereMap>
      <DemoBar>
        {OVERLAYS.map((overlay) => (
          <DemoButton
            active={active.includes(overlay)}
            key={overlay}
            onClick={() => toggle(overlay)}
          >
            {text.overlays[overlay]}
          </DemoButton>
        ))}
        <DemoNote>{text.hint}</DemoNote>
      </DemoBar>
    </>
  );
}

export function PredefinedOverlaysDemo() {
  return (
    <DemoFrame height="420px">
      <LiveOverlays />
    </DemoFrame>
  );
}
