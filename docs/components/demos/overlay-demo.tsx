"use client";

import { Marker, SphereMap, useMarkers } from "gistda-sphere-react";
import {
  DemoBar,
  DemoButton,
  DemoFrame,
  DemoNote,
  useDemoText,
} from "./demo-ui";
import { useDocLanguage } from "./use-doc-language";

const CENTER = { lat: 13.7563, lon: 100.5018 };

const TEXT = {
  en: {
    add: "Add marker",
    clear: "Clear all",
    count: (count: number) => `${count} marker${count === 1 ? "" : "s"}`,
    marker: (n: number) => `Marker ${n}`,
    removeLast: "Remove last",
  },
  th: {
    add: "เพิ่มหมุด",
    clear: "ล้างทั้งหมด",
    count: (count: number) => `${count} หมุด`,
    marker: (n: number) => `หมุด ${n}`,
    removeLast: "ลบหมุดล่าสุด",
  },
};

/** Markers managed as a collection with `useMarkers`. */
function MarkerCollection() {
  const language = useDocLanguage();
  const text = useDemoText(TEXT);
  const { items, add, remove, clear } = useMarkers();

  const addRandom = () => {
    const offset = () => (Math.random() - 0.5) * 0.1;
    add({
      position: { lat: CENTER.lat + offset(), lon: CENTER.lon + offset() },
      title: text.marker(items.length + 1),
    });
  };

  return (
    <>
      <SphereMap
        center={CENTER}
        language={language}
        style={{ height: "350px", width: "100%" }}
        zoom={12}
      >
        {items.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            title={marker.title}
          />
        ))}
      </SphereMap>
      <DemoBar>
        <DemoButton onClick={addRandom}>{text.add}</DemoButton>
        <DemoButton
          disabled={items.length === 0}
          onClick={() => {
            const last = items.at(-1);
            if (last) {
              remove(last.id);
            }
          }}
        >
          {text.removeLast}
        </DemoButton>
        <DemoButton disabled={items.length === 0} onClick={clear}>
          {text.clear}
        </DemoButton>
        <DemoNote>{text.count(items.length)}</DemoNote>
      </DemoBar>
    </>
  );
}

export function OverlayDemo() {
  return (
    <DemoFrame height="420px">
      <MarkerCollection />
    </DemoFrame>
  );
}
