"use client";

import { SphereMap } from "gistda-sphere-react";
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
    clear: "Clear",
    clicked: (lat: string, lon: string) => `Clicked at ${lat}, ${lon}`,
    empty: "No events yet",
    hint: "Click, zoom, or drag the map to see events",
    moved: (lat: string, lon: string) => `Moved to ${lat}, ${lon}`,
    zoomed: (zoom: string) => `Zoomed to level ${zoom}`,
  },
  th: {
    clear: "ล้าง",
    clicked: (lat: string, lon: string) => `คลิกที่ ${lat}, ${lon}`,
    empty: "ยังไม่มีเหตุการณ์",
    hint: "คลิก ซูม หรือลากแผนที่เพื่อดูเหตุการณ์",
    moved: (lat: string, lon: string) => `เลื่อนไปที่ ${lat}, ${lon}`,
    zoomed: (zoom: string) => `ซูมไปที่ระดับ ${zoom}`,
  },
};

interface LogEntry {
  id: number;
  message: string;
  time: string;
}

let nextId = 1;

/** A map that logs its click, move and zoom events. */
function MapWithLog() {
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
        onClick={(location) =>
          addLog(text.clicked(location.lat.toFixed(4), location.lon.toFixed(4)))
        }
        onLocation={(location) =>
          addLog(text.moved(location.lat.toFixed(4), location.lon.toFixed(4)))
        }
        onZoom={(zoom) => addLog(text.zoomed(zoom.toFixed(2)))}
        style={{ height: "300px", width: "100%" }}
        zoom={10}
      />
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

export function SphereMapDemo() {
  return (
    <DemoFrame height="400px">
      <MapWithLog />
    </DemoFrame>
  );
}
