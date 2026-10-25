"use client";

import { SphereMap } from "gistda-sphere-react";
import { useRef, useState } from "react";

interface Entry {
  id: number;
  message: string;
}

/** Logs clicks and finished moves from `SphereMap`'s event props. */
export function MapEvents() {
  const nextId = useRef(0);
  const [entries, setEntries] = useState<Entry[]>([]);

  const log = (message: string) => {
    nextId.current += 1;
    const entry = { id: nextId.current, message };
    setEntries((previous) => [entry, ...previous].slice(0, 20));
  };

  return (
    <>
      <SphereMap
        center={{ lat: 13.7563, lon: 100.5018 }}
        onClick={({ lat, lon }) =>
          log(`Clicked at ${lat.toFixed(4)}, ${lon.toFixed(4)}`)
        }
        onViewChange={({ center, zoom }) =>
          log(
            `View: ${center.lat.toFixed(4)}, ${center.lon.toFixed(4)} at zoom ${zoom.toFixed(2)}`
          )
        }
        style={{ height: 300 }}
        zoom={10}
      />
      <div className="controls">
        <small>Click, zoom, or drag the map to see events.</small>
        <button onClick={() => setEntries([])} type="button">
          Clear
        </button>
        <ul>
          {entries.length === 0 ? <li>No events yet</li> : null}
          {entries.map((entry) => (
            <li key={entry.id}>{entry.message}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
