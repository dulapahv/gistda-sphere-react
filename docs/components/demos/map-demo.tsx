/** biome-ignore-all lint/style/noExportedImports: Need to re-export overlay components so MDX files can use them directly */
"use client";

import {
  Circle,
  Dot,
  GeoJson,
  Layer,
  type Location,
  Marker,
  ObjectOverlay,
  Polygon,
  Polyline,
  Popup,
  PredefinedOverlay,
  Rectangle,
  SphereMap,
  Tag,
} from "gistda-sphere-react";
import type { ReactNode } from "react";
import { DemoFrame } from "./demo-ui";
import { useDocLanguage } from "./use-doc-language";

interface MapDemoProps {
  center?: Location;
  children?: ReactNode;
  height?: string;
  zoom?: number;
}

/** A live map in the docs language; overlays go in as children. */
export function MapDemo({
  children,
  height = "400px",
  center = { lat: 13.7563, lon: 100.5018 },
  zoom = 10,
}: MapDemoProps) {
  const language = useDocLanguage();

  return (
    <DemoFrame height={height}>
      <SphereMap
        center={center}
        language={language}
        style={{ height, width: "100%" }}
        zoom={zoom}
      >
        {children}
      </SphereMap>
    </DemoFrame>
  );
}

// Re-export overlay components so MDX files can use them directly
export {
  Circle,
  Dot,
  GeoJson,
  Layer,
  Marker,
  ObjectOverlay,
  Polygon,
  Polyline,
  Popup,
  PredefinedOverlay,
  Rectangle,
  Tag,
};
