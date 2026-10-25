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

const ZONE_A = [
  { lat: 13.8, lon: 100.45 },
  { lat: 13.8, lon: 100.55 },
  { lat: 13.7, lon: 100.55 },
  { lat: 13.7, lon: 100.45 },
];
const ZONE_B = [
  { lat: 13.76, lon: 100.5 },
  { lat: 13.76, lon: 100.6 },
  { lat: 13.66, lon: 100.6 },
  { lat: 13.66, lon: 100.5 },
];

type Operation = "union" | "intersection" | "difference" | "split";
const OPERATIONS: { label: string; operation: Operation }[] = [
  { label: "A ∪ B", operation: "union" },
  { label: "A ∩ B", operation: "intersection" },
  { label: "A − B", operation: "difference" },
  { label: "Split A by B", operation: "split" },
];

/** Polygon operations, spatial tests and measurements through component refs. */
export function SpatialAnalysis() {
  const { formatThaiArea } = useSphereUtils();
  const zoneA = useRef<PolygonRef>(null);
  const zoneB = useRef<PolygonRef>(null);
  const [result, setResult] = useState<GeoJSON | null>(null);
  const [message, setMessage] = useState("");

  const run = (operation: Operation) => {
    const a = zoneA.current;
    const b = zoneB.current?.getPolygon();
    if (!(a && b)) {
      return;
    }
    const shapes: (SpherePolygon | null)[] =
      operation === "split" ? a.split(b) : [a[operation](b)];
    const features = shapes
      .filter((shape): shape is SpherePolygon => shape !== null)
      .map((shape) => shape.toJSON() as GeoJSONFeature);
    setResult({ features, type: "FeatureCollection" });
    setMessage(`Result: ${features.length} shape(s)`);
  };

  const test = () => {
    const a = zoneA.current;
    const b = zoneB.current?.getPolygon();
    if (a && b) {
      const intersects = a.intersects(b) ? "yes" : "no";
      const contains = a.contains(b) ? "yes" : "no";
      setMessage(`A intersects B: ${intersects} · A contains B: ${contains}`);
    }
  };

  const measure = () => {
    const a = zoneA.current;
    const squareMeters = a?.getArea();
    if (a && typeof squareMeters === "number") {
      const area = a.getArea("en");
      setMessage(`Area of A: ${area} (${formatThaiArea(squareMeters, "en")})`);
    }
  };

  return (
    <>
      <SphereMap
        center={{ lat: 13.73, lon: 100.52 }}
        style={{ height: 400 }}
        zoom={10}
      >
        <Polygon
          fillColor="rgba(59, 130, 246, 0.25)"
          label="A"
          lineColor="rgb(37, 99, 235)"
          positions={ZONE_A}
          ref={zoneA}
        />
        <Polygon
          fillColor="rgba(245, 158, 11, 0.25)"
          label="B"
          lineColor="rgb(217, 119, 6)"
          positions={ZONE_B}
          ref={zoneB}
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
      <div className="controls">
        {OPERATIONS.map(({ label, operation }) => (
          <button key={operation} onClick={() => run(operation)} type="button">
            {label}
          </button>
        ))}
        <button onClick={test} type="button">
          Test
        </button>
        <button onClick={measure} type="button">
          Measure A
        </button>
        <output>{message}</output>
      </div>
    </>
  );
}
