/** biome-ignore-all lint/style/noExportedImports: Need to re-export overlay components so MDX files can use them directly */
"use client";

import {
  Circle,
  Dot,
  type Language,
  type Location,
  Marker,
  Polygon,
  Polyline,
  Popup,
  Rectangle,
  SphereMap,
  SphereProvider,
} from "gistda-sphere-react";
import type { ReactNode } from "react";

const API_KEY = process.env.NEXT_PUBLIC_SPHERE_API_KEY ?? "";

interface MapDemoProps {
  children?: ReactNode;
  height?: string;
  center?: Location;
  zoom?: number;
  language?: Language;
}

export function MapDemo({
  children,
  height = "400px",
  center = { lon: 100.5018, lat: 13.7563 },
  zoom = 10,
  language,
}: MapDemoProps) {
  if (!API_KEY) {
    return (
      <div
        className="flex w-full items-center justify-center rounded-xl border border-fd-border bg-fd-card text-fd-muted-foreground text-sm"
        style={{ height }}
      >
        Set <code>NEXT_PUBLIC_SPHERE_API_KEY</code> in{" "}
        <code>docs/.env.local</code> to see live demos.
      </div>
    );
  }

  return (
    <div className="my-4 w-full overflow-hidden rounded-xl border border-fd-border">
      <SphereProvider apiKey={API_KEY}>
        <SphereMap
          center={center}
          language={language}
          style={{ width: "100%", height }}
          zoom={zoom}
        >
          {children}
        </SphereMap>
      </SphereProvider>
    </div>
  );
}

// Re-export overlay components so MDX files can use them directly
export { Circle, Dot, Marker, Polygon, Polyline, Popup, Rectangle };
