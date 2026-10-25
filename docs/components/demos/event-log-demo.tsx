"use client";

import {
  Marker,
  SphereMap,
  useMapControls,
  useMapEvent,
  useMapReady,
} from "gistda-sphere-react";
import { useCallback, useState } from "react";
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
    center: (lat: string, lon: string) => `Center: ${lat}, ${lon}`,
    clear: "Clear",
    click: (lat: string, lon: string) => `Click: ${lat}, ${lon}`,
    empty: "No events yet",
    hint: "Click the map or the marker, drag, or zoom to see events",
    marker: "Bangkok",
    overlayClick: (lat: string, lon: string) =>
      `Marker clicked at ${lat}, ${lon}`,
    ready: "Map is ready",
    zoom: (zoom: string) => `Zoom: ${zoom}`,
  },
  th: {
    center: (lat: string, lon: string) => `กึ่งกลาง: ${lat}, ${lon}`,
    clear: "ล้าง",
    click: (lat: string, lon: string) => `คลิก: ${lat}, ${lon}`,
    empty: "ยังไม่มีเหตุการณ์",
    hint: "คลิกแผนที่หรือหมุด ลาก หรือซูมเพื่อดูเหตุการณ์",
    marker: "กรุงเทพฯ",
    overlayClick: (lat: string, lon: string) => `คลิกหมุดที่ ${lat}, ${lon}`,
    ready: "แผนที่พร้อมใช้งาน",
    zoom: (zoom: string) => `ซูม: ${zoom}`,
  },
};

interface LogEntry {
  id: number;
  message: string;
  time: string;
}

let nextId = 1;

/** Subscribes to map events with the event hooks. */
function EventListener({ onLog }: { onLog: (message: string) => void }) {
  const text = useDemoText(TEXT);
  const { getCenter, getZoom } = useMapControls();

  useMapReady(() => onLog(text.ready));
  useMapEvent("click", (location) =>
    onLog(text.click(location.lat.toFixed(4), location.lon.toFixed(4)))
  );
  useMapEvent("overlayClick", (_overlay, location) =>
    onLog(text.overlayClick(location.lat.toFixed(4), location.lon.toFixed(4)))
  );
  useMapEvent("zoom", () => onLog(text.zoom((getZoom() ?? 0).toFixed(2))));
  useMapEvent("drop", () => {
    const center = getCenter();
    if (center) {
      onLog(text.center(center.lat.toFixed(4), center.lon.toFixed(4)));
    }
  });

  return null;
}

/** A map with a live event log. */
function EventLog() {
  const language = useDocLanguage();
  const text = useDemoText(TEXT);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((message: string) => {
    const time = new Date().toLocaleTimeString([], { hour12: false });
    nextId += 1;
    setLogs((previous) =>
      [{ id: nextId, message, time }, ...previous].slice(0, 20)
    );
  }, []);

  return (
    <>
      <SphereMap
        center={{ lat: 13.7563, lon: 100.5018 }}
        language={language}
        style={{ height: "300px", width: "100%" }}
        zoom={10}
      >
        <EventListener onLog={addLog} />
        <Marker
          position={{ lat: 13.7563, lon: 100.5018 }}
          title={text.marker}
        />
      </SphereMap>
      <DemoBar>
        <DemoNote>{text.hint}</DemoNote>
        <span className="ml-auto">
          <DemoButton onClick={() => setLogs([])}>{text.clear}</DemoButton>
        </span>
        <div className="max-h-30 w-full overflow-y-auto rounded-md border border-fd-border bg-fd-muted p-2 font-mono text-fd-foreground text-xs">
          {logs.length === 0 ? (
            <span className="text-fd-muted-foreground italic">
              {text.empty}
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
      </DemoBar>
    </>
  );
}

export function EventLogDemo() {
  return (
    <DemoFrame height="400px">
      <EventLog />
    </DemoFrame>
  );
}
