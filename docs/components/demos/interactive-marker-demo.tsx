"use client";

import { type Location, Marker, SphereMap } from "gistda-sphere-react";
import { useState } from "react";
import {
  DemoBar,
  DemoButton,
  DemoFrame,
  DemoNote,
  useDemoText,
} from "./demo-ui";
import { useDocLanguage } from "./use-doc-language";

const TEXT = {
  en: {
    clear: "Clear",
    hint: (count: number) =>
      `Click the map to place markers (${count} placed). Drag them to move.`,
  },
  th: {
    clear: "ล้าง",
    hint: (count: number) =>
      `คลิกแผนที่เพื่อวางหมุด (วางแล้ว ${count} หมุด) ลากหมุดเพื่อย้ายได้`,
  },
};

interface PlacedMarker {
  id: number;
  position: Location;
}

let nextId = 1;

/** Click to add markers; drag to move them. */
function MarkerPlacement() {
  const language = useDocLanguage();
  const text = useDemoText(TEXT);
  const [markers, setMarkers] = useState<PlacedMarker[]>([]);

  const move = (id: number, position: Location) =>
    setMarkers((previous) =>
      previous.map((marker) =>
        marker.id === id ? { ...marker, position } : marker
      )
    );

  return (
    <>
      <SphereMap
        center={{ lat: 13.7563, lon: 100.5018 }}
        language={language}
        onClick={({ lat, lon }) => {
          nextId += 1;
          setMarkers((previous) => [
            ...previous,
            { id: nextId, position: { lat, lon } },
          ]);
        }}
        style={{ height: "400px", width: "100%" }}
        zoom={10}
      >
        {markers.map((marker) => (
          <Marker
            draggable
            key={marker.id}
            onDrop={(_, position) => move(marker.id, position)}
            position={marker.position}
            title={`${marker.position.lat.toFixed(4)}, ${marker.position.lon.toFixed(4)}`}
          />
        ))}
      </SphereMap>
      <DemoBar>
        <DemoNote>{text.hint(markers.length)}</DemoNote>
        <span className="ml-auto">
          <DemoButton
            disabled={markers.length === 0}
            onClick={() => setMarkers([])}
          >
            {text.clear}
          </DemoButton>
        </span>
      </DemoBar>
    </>
  );
}

export function InteractiveMarkerDemo() {
  return (
    <DemoFrame>
      <MarkerPlacement />
    </DemoFrame>
  );
}
