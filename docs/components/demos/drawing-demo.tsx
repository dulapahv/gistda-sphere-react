"use client";

import {
  Dot,
  type Location,
  Polygon,
  Polyline,
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

const TEXT = {
  en: {
    clear: "Clear",
    finish: "Finish",
    hint: (drawn: number, pending: number) =>
      `Click to add corners, then double-click or press Finish (${drawn} drawn, ${pending} pending points)`,
    polygon: (n: number) => `Polygon ${n}`,
  },
  th: {
    clear: "ล้าง",
    finish: "เสร็จสิ้น",
    hint: (drawn: number, pending: number) =>
      `คลิกเพื่อเพิ่มมุม แล้วดับเบิลคลิกหรือกด เสร็จสิ้น (วาดแล้ว ${drawn} รูป รออยู่ ${pending} จุด)`,
    polygon: (n: number) => `รูปหลายเหลี่ยม ${n}`,
  },
};

/** Drops repeated points, e.g. the two clicks of a double-click. */
function withoutRepeats(points: Location[]): Location[] {
  return points.filter(
    (point, index) =>
      index === 0 ||
      point.lat !== points[index - 1]?.lat ||
      point.lon !== points[index - 1]?.lon
  );
}

/** Click to add polygon corners; double-click to finish. */
function PolygonDrawing() {
  const language = useDocLanguage();
  const text = useDemoText(TEXT);
  const [points, setPoints] = useState<Location[]>([]);
  const [polygons, setPolygons] = useState<Location[][]>([]);

  const finish = () => {
    const corners = withoutRepeats(points);
    if (corners.length >= 3) {
      setPolygons((previous) => [...previous, corners]);
      setPoints([]);
    }
  };

  return (
    <>
      <SphereMap
        center={{ lat: 13.75, lon: 100.5 }}
        language={language}
        onClick={({ lat, lon }) =>
          setPoints((previous) => [...previous, { lat, lon }])
        }
        onDoubleClick={finish}
        // MapLibre option: keep double-clicks for finishing shapes.
        options={{ doubleClickZoom: false }}
        style={{ height: "400px", width: "100%" }}
        zoom={10}
      >
        {polygons.map((corners, index) => (
          <Polygon
            fillColor="rgba(255, 0, 0, 0.3)"
            // Polygons are append-only, so the index identifies them.
            // biome-ignore lint/suspicious/noArrayIndexKey: append-only list
            key={index}
            lineColor="red"
            lineWidth={2}
            positions={corners}
            title={text.polygon(index + 1)}
          />
        ))}
        {points.length >= 2 ? (
          <Polyline
            lineColor="rgba(255, 0, 0, 0.6)"
            lineStyle="Dashed"
            lineWidth={2}
            positions={[...points, points[0] as Location]}
          />
        ) : null}
        {points.map((point, index) => (
          <Dot
            // biome-ignore lint/suspicious/noArrayIndexKey: append-only list
            key={index}
            lineColor="red"
            lineWidth={8}
            position={point}
          />
        ))}
      </SphereMap>
      <DemoBar>
        <DemoNote>
          {text.hint(polygons.length, withoutRepeats(points).length)}
        </DemoNote>
        <span className="ml-auto flex gap-2">
          <DemoButton
            disabled={withoutRepeats(points).length < 3}
            onClick={finish}
          >
            {text.finish}
          </DemoButton>
          <DemoButton
            onClick={() => {
              setPoints([]);
              setPolygons([]);
            }}
          >
            {text.clear}
          </DemoButton>
        </span>
      </DemoBar>
    </>
  );
}

export function DrawingDemo() {
  return (
    <DemoFrame>
      <PolygonDrawing />
    </DemoFrame>
  );
}
