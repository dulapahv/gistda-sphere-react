"use client";

import {
  type Location,
  Marker,
  SphereMap,
  useMapControls,
  useMapEvent,
  useMapReady,
  useMapZoom,
} from "gistda-sphere-react";
import { useRef, useState } from "react";

const BANGKOK = { lat: 13.7563, lon: 100.5018 };

interface Entry {
  id: number;
  message: string;
  time: string;
}

/** Formats a location for the log. */
function format({ lat, lon }: Location): string {
  return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}

/** Logs map events from the event hooks, newest first. */
export function EventLog() {
  const nextId = useRef(0);
  const [entries, setEntries] = useState<Entry[]>([]);
  const { getCenter } = useMapControls();

  const log = (message: string) => {
    nextId.current += 1;
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    const entry = { id: nextId.current, message, time };
    setEntries((previous) => [entry, ...previous].slice(0, 20));
  };

  useMapReady(() => log("Map is ready"));
  useMapEvent("click", (location) => log(`Clicked at ${format(location)}`));
  useMapEvent("overlayClick", (_overlay, location) =>
    log(`Marker clicked at ${format(location)}`)
  );
  useMapZoom((zoom) => log(`Zoom ${zoom.toFixed(2)}`));
  useMapEvent("drop", () => {
    const center = getCenter();
    if (center) {
      log(`Dragged to ${format(center)}`);
    }
  });

  return (
    <>
      <SphereMap center={BANGKOK} style={{ height: 300 }} zoom={10}>
        <Marker position={BANGKOK} title="Bangkok" />
      </SphereMap>
      <div className="controls">
        <small>Click the map or the marker, drag, or zoom to see events.</small>
        <button onClick={() => setEntries([])} type="button">
          Clear
        </button>
        <ul>
          {entries.length === 0 ? <li>No events yet</li> : null}
          {entries.map((entry) => (
            <li key={entry.id}>
              <small>{entry.time}</small> {entry.message}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
