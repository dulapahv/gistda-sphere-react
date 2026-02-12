"use client";

import {
  type Location,
  Marker,
  Polygon,
  Polyline,
  SphereMap,
  SphereProvider,
} from "gistda-sphere-react";
import { useCallback, useState } from "react";
import { useDocLanguage } from "./use-doc-language";

const API_KEY = process.env.NEXT_PUBLIC_SPHERE_API_KEY ?? "";

export function DrawingDemo() {
  const [points, setPoints] = useState<Location[]>([]);
  const [polygons, setPolygons] = useState<Location[][]>([]);
  const language = useDocLanguage();

  const handleClick = useCallback((location: Location) => {
    setPoints((prev) => [...prev, location]);
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (points.length >= 3) {
      setPolygons((prev) => [...prev, points]);
      setPoints([]);
    }
  }, [points]);

  const handleClear = () => {
    setPoints([]);
    setPolygons([]);
  };

  if (!API_KEY) {
    return null;
  }

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-fd-border">
      <SphereProvider apiKey={API_KEY}>
        <SphereMap
          center={{ lon: 100.5, lat: 13.75 }}
          language={language}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          style={{ width: "100%", height: "400px" }}
          zoom={10}
        >
          {polygons.map((positions, i) => (
            <Polygon
              fillColor="rgba(255, 0, 0, 0.3)"
              key={`polygon-${positions.map((p) => `${p.lon}`).join("-")}`}
              lineColor="red"
              lineWidth={2}
              positions={positions}
              title={`Polygon ${i + 1}`}
            />
          ))}
          {points.length >= 2 && (
            <Polyline
              lineColor="rgba(255, 0, 0, 0.6)"
              lineWidth={2}
              positions={[...points, points[0]]}
            />
          )}
          {points.map((pos) => (
            <Marker key={`${pos.lon}-${pos.lat}`} position={pos} />
          ))}
        </SphereMap>
      </SphereProvider>
      <div className="flex flex-wrap items-center gap-2 bg-fd-card p-3">
        <span className="py-2 text-fd-muted-foreground text-sm">
          Click to add points, double-click to complete polygon (
          {polygons.length} drawn, {points.length} pending points)
        </span>
        <button
          className="ml-auto cursor-pointer rounded-md border border-fd-border bg-fd-secondary px-2 py-1.5 text-fd-secondary-foreground text-xs hover:bg-fd-accent disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleClear}
          type="button"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
