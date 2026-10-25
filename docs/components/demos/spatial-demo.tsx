"use client";

import {
  type GeoJSON,
  type GeoJSONFeature,
  GeoJson,
  Polygon,
  type PolygonRef,
  SphereMap,
  type SpherePolygon,
  useSphereUtils,
} from "gistda-sphere-react";
import { useRef, useState } from "react";
import {
  DemoBar,
  DemoButton,
  DemoFrame,
  DemoNote,
  useDemoText,
} from "./demo-ui";
import { useDocLanguage } from "./use-doc-language";

const SQUARE_A = [
  { lat: 13.8, lon: 100.45 },
  { lat: 13.8, lon: 100.55 },
  { lat: 13.7, lon: 100.55 },
  { lat: 13.7, lon: 100.45 },
];
const SQUARE_B = [
  { lat: 13.76, lon: 100.5 },
  { lat: 13.76, lon: 100.6 },
  { lat: 13.66, lon: 100.6 },
  { lat: 13.66, lon: 100.5 },
];

type Operation = "union" | "intersection" | "difference" | "split";
const OPERATIONS: readonly Operation[] = [
  "union",
  "intersection",
  "difference",
  "split",
];

const TEXT = {
  en: {
    area: (value: string, thai: string) => `Area of A: ${value} (${thai})`,
    contains: (value: boolean) => `A contains B: ${value ? "yes" : "no"}`,
    intersects: (value: boolean) => `A intersects B: ${value ? "yes" : "no"}`,
    measure: "Measure A",
    operations: {
      difference: "A − B",
      intersection: "A ∩ B",
      split: "Split A by B",
      union: "A ∪ B",
    },
    parts: (count: number) => `Result: ${count} shape${count === 1 ? "" : "s"}`,
    test: "Test",
  },
  th: {
    area: (value: string, thai: string) => `พื้นที่ของ A: ${value} (${thai})`,
    contains: (value: boolean) => `A ครอบคลุม B: ${value ? "ใช่" : "ไม่ใช่"}`,
    intersects: (value: boolean) => `A ตัดกับ B: ${value ? "ใช่" : "ไม่ใช่"}`,
    measure: "วัดพื้นที่ A",
    operations: {
      difference: "A − B",
      intersection: "A ∩ B",
      split: "แบ่ง A ด้วย B",
      union: "A ∪ B",
    },
    parts: (count: number) => `ผลลัพธ์: ${count} รูปทรง`,
    test: "ทดสอบ",
  },
};

/** Polygon set operations and spatial tests through component refs. */
function SpatialAnalysis() {
  const language = useDocLanguage();
  const text = useDemoText(TEXT);
  const { formatThaiArea } = useSphereUtils();
  const refA = useRef<PolygonRef>(null);
  const refB = useRef<PolygonRef>(null);
  const [result, setResult] = useState<GeoJSON | null>(null);
  const [message, setMessage] = useState("");

  const run = (operation: Operation) => {
    const a = refA.current;
    const b = refB.current?.getPolygon();
    if (!(a && b)) {
      return;
    }
    const shapes: (SpherePolygon | null)[] =
      operation === "split" ? a.split(b) : [a[operation](b)];
    const features = shapes
      .filter((shape): shape is SpherePolygon => shape !== null)
      .map((shape) => shape.toJSON() as GeoJSONFeature);
    setResult({ features, type: "FeatureCollection" });
    setMessage(text.parts(features.length));
  };

  const test = () => {
    const a = refA.current;
    const b = refB.current?.getPolygon();
    if (a && b) {
      setMessage(
        `${text.intersects(a.intersects(b))} · ${text.contains(a.contains(b))}`
      );
    }
  };

  const measure = () => {
    const area = refA.current?.getArea();
    if (typeof area === "number") {
      setMessage(
        text.area(
          String(refA.current?.getArea(language)),
          formatThaiArea(area, language)
        )
      );
    }
  };

  return (
    <>
      <SphereMap
        center={{ lat: 13.73, lon: 100.52 }}
        language={language}
        style={{ height: "400px", width: "100%" }}
        zoom={10}
      >
        <Polygon
          fillColor="rgba(59, 130, 246, 0.25)"
          label="A"
          lineColor="rgb(37, 99, 235)"
          positions={SQUARE_A}
          ref={refA}
        />
        <Polygon
          fillColor="rgba(245, 158, 11, 0.25)"
          label="B"
          lineColor="rgb(217, 119, 6)"
          positions={SQUARE_B}
          ref={refB}
        />
        {result ? (
          <GeoJson
            data={result}
            style={{
              fillColor: "rgba(239, 68, 68, 0.35)",
              lineColor: "rgb(220, 38, 38)",
              lineStyle: "Dashed",
              lineWidth: 3,
            }}
          />
        ) : null}
      </SphereMap>
      <DemoBar>
        {OPERATIONS.map((operation) => (
          <DemoButton key={operation} onClick={() => run(operation)}>
            {text.operations[operation]}
          </DemoButton>
        ))}
        <DemoButton onClick={test}>{text.test}</DemoButton>
        <DemoButton onClick={measure}>{text.measure}</DemoButton>
        <DemoNote>{message}</DemoNote>
      </DemoBar>
    </>
  );
}

export function SpatialDemo() {
  return (
    <DemoFrame height="460px">
      <SpatialAnalysis />
    </DemoFrame>
  );
}
