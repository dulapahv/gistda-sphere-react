"use client";

import {
  type Location,
  Marker,
  Polygon,
  type PolygonRef,
  SphereMap,
} from "gistda-sphere-react";
import { useRef, useState } from "react";

interface Zone {
  /** RGB, so the fill can use a different opacity. */
  color: string;
  corners: Location[];
  fee: number;
  name: string;
}

const ZONES: Zone[] = [
  {
    color: "34, 197, 94",
    corners: [
      { lat: 13.77, lon: 100.48 },
      { lat: 13.77, lon: 100.54 },
      { lat: 13.71, lon: 100.54 },
      { lat: 13.71, lon: 100.48 },
    ],
    fee: 0,
    name: "Zone A",
  },
  {
    color: "59, 130, 246",
    corners: [
      { lat: 13.77, lon: 100.54 },
      { lat: 13.77, lon: 100.62 },
      { lat: 13.7, lon: 100.62 },
      { lat: 13.7, lon: 100.54 },
    ],
    fee: 30,
    name: "Zone B",
  },
  {
    color: "245, 158, 11",
    corners: [
      { lat: 13.85, lon: 100.5 },
      { lat: 13.85, lon: 100.6 },
      { lat: 13.77, lon: 100.6 },
      { lat: 13.77, lon: 100.5 },
    ],
    fee: 60,
    name: "Zone C",
  },
];

interface Check {
  point: Location;
  zone: Zone | null;
}

/** Describes the delivery terms at the checked point. */
function describe({ zone }: Check): string {
  if (!zone) {
    return "Outside the delivery area.";
  }
  return zone.fee === 0
    ? `${zone.name}: free delivery.`
    : `${zone.name}: delivery costs ฿${zone.fee}.`;
}

/** Click the map or drag the pin to find the delivery zone of a point. */
export function DeliveryZones() {
  const zoneRefs = useRef(new Map<string, PolygonRef>());
  const [check, setCheck] = useState<Check | null>(null);

  const checkPoint = (point: Location) => {
    const zone =
      ZONES.find(({ name }) => zoneRefs.current.get(name)?.contains(point)) ??
      null;
    setCheck({ point, zone });
  };

  return (
    <>
      <SphereMap
        center={{ lat: 13.77, lon: 100.55 }}
        onClick={({ lat, lon }) => checkPoint({ lat, lon })}
        // Clicks on a zone are overlay clicks, not map clicks.
        onOverlayClick={(_, location) => checkPoint(location)}
        style={{ height: 400 }}
        zoom={11}
      >
        {ZONES.map((zone) => (
          <Polygon
            fillColor={`rgba(${zone.color}, ${check?.zone === zone ? 0.45 : 0.15})`}
            key={zone.name}
            label={zone.name}
            lineColor={`rgb(${zone.color})`}
            positions={zone.corners}
            ref={(ref) => {
              if (ref) {
                zoneRefs.current.set(zone.name, ref);
              }
              return () => {
                zoneRefs.current.delete(zone.name);
              };
            }}
          />
        ))}
        {check ? (
          <Marker
            draggable
            onDrop={(_, location) => checkPoint(location)}
            position={check.point}
          />
        ) : null}
      </SphereMap>
      <div className="controls">
        {check ? (
          <output>{describe(check)}</output>
        ) : (
          <small>Click the map to check a delivery address.</small>
        )}
        {check ? <small>Drag the pin to try another spot.</small> : null}
      </div>
    </>
  );
}
