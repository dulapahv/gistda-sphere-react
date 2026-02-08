"use client";

import {
  type Location,
  SphereMap,
  SphereProvider,
  useMapClick,
  useMapLocation,
  useMapReady,
  useMapZoom,
} from "gistda-sphere-react";
import { useCallback, useState } from "react";

const API_KEY = process.env.NEXT_PUBLIC_SPHERE_API_KEY ?? "";

interface LogEntry {
  id: number;
  time: string;
  message: string;
}

function EventListener({ onLog }: { onLog: (message: string) => void }) {
  useMapReady(() => {
    onLog("Map is ready");
  });

  useMapClick((location: Location) => {
    onLog(`Click: ${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`);
  });

  useMapZoom(() => {
    onLog("Zoom changed");
  });

  useMapLocation(() => {
    onLog("Center changed");
  });

  return null;
}

export function EventLogDemo() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((message: string) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    setLogs((prev) =>
      [{ id: Math.random(), time, message }, ...prev].slice(0, 20)
    );
  }, []);

  if (!API_KEY) {
    return null;
  }

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-fd-border">
      <SphereProvider apiKey={API_KEY}>
        <SphereMap
          center={{ lon: 100.5018, lat: 13.7563 }}
          language="en"
          style={{ width: "100%", height: "300px" }}
          zoom={10}
        >
          <EventListener onLog={addLog} />
        </SphereMap>
      </SphereProvider>
      <div className="flex flex-col gap-2 bg-fd-card p-3">
        <div className="flex items-center justify-between">
          <span className="text-[0.8125rem] text-fd-muted-foreground">
            Click, drag, or zoom the map to see events
          </span>
          <button
            className="cursor-pointer rounded-md border border-fd-border bg-fd-secondary px-2 py-1 text-fd-secondary-foreground text-xs hover:bg-fd-accent disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setLogs([])}
            type="button"
          >
            Clear
          </button>
        </div>
        <div className="max-h-30 overflow-y-auto rounded-md border border-fd-border bg-fd-muted p-2 font-mono text-fd-foreground text-xs">
          {logs.length === 0 ? (
            <span className="text-fd-muted-foreground italic">
              No events yet
            </span>
          ) : (
            logs.map((entry) => (
              <div
                className="flex gap-2 border-fd-border border-b py-0.5 last:border-b-0"
                key={entry.id}
              >
                <span className="shrink-0 text-fd-muted-foreground">
                  {entry.time}
                </span>
                <span>{entry.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
