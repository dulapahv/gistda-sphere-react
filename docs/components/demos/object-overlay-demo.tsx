"use client";

import { ObjectOverlay, SphereMap } from "gistda-sphere-react";
import { useState } from "react";
import {
  DemoBar,
  DemoButton,
  DemoFrame,
  DemoNote,
  useDemoText,
} from "./demo-ui";
import { useDocLanguage } from "./use-doc-language";

/** Province area IDs, as returned by search results. */
const AREAS = [
  { id: "A10000000", key: "bangkok" },
  { id: "A50000000", key: "chiangMai" },
  { id: "A83000000", key: "phuket" },
] as const;

type AreaKey = (typeof AREAS)[number]["key"];

const TEXT = {
  en: {
    areas: { bangkok: "Bangkok", chiangMai: "Chiang Mai", phuket: "Phuket" },
    failed:
      "The outline didn't load. The API key may not have the POI details service (poi/get).",
    loaded: (name: string) => `Loaded the outline of ${name}.`,
  },
  th: {
    areas: { bangkok: "กรุงเทพฯ", chiangMai: "เชียงใหม่", phuket: "ภูเก็ต" },
    failed:
      "โหลดขอบเขตไม่สำเร็จ API key อาจยังไม่ได้เปิดบริการรายละเอียดสถานที่ (poi/get)",
    loaded: (name: string) => `โหลดขอบเขตของ${name}แล้ว`,
  },
};

/** Province outlines loaded by ID with `<ObjectOverlay>`. */
function ProvinceOutline() {
  const language = useDocLanguage();
  const text = useDemoText(TEXT);
  const [area, setArea] = useState<AreaKey>("bangkok");
  const [status, setStatus] = useState<{ error: boolean; text: string } | null>(
    null
  );
  const selected = AREAS.find((item) => item.key === area) ?? AREAS[0];

  return (
    <>
      <SphereMap
        center={{ lat: 13.7563, lon: 100.5018 }}
        language={language}
        style={{ height: "400px", width: "100%" }}
        zoom={8}
      >
        <ObjectOverlay
          fillColor="rgba(59, 130, 246, 0.15)"
          fitBounds
          id={selected.id}
          key={selected.id}
          lineColor="rgb(37, 99, 235)"
          lineWidth={2}
          onError={() => setStatus({ error: true, text: text.failed })}
          onLoad={() =>
            setStatus({ error: false, text: text.loaded(text.areas[area]) })
          }
          timeout={10_000}
        />
      </SphereMap>
      <DemoBar>
        {AREAS.map((item) => (
          <DemoButton
            active={area === item.key}
            key={item.key}
            onClick={() => {
              setArea(item.key);
              setStatus(null);
            }}
          >
            {text.areas[item.key]}
          </DemoButton>
        ))}
        {status ? (
          <DemoNote tone={status.error ? "error" : "muted"}>
            {status.text}
          </DemoNote>
        ) : null}
      </DemoBar>
    </>
  );
}

export function ObjectOverlayDemo() {
  return (
    <DemoFrame height="460px">
      <ProvinceOutline />
    </DemoFrame>
  );
}
