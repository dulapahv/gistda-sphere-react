"use client";

import {
  Marker,
  SphereMap,
  SphereProvider,
  useMarkers,
} from "gistda-sphere-react";

const API_KEY = process.env.NEXT_PUBLIC_SPHERE_API_KEY ?? "";

const CENTER = { lon: 100.5018, lat: 13.7563 };

function OverlayControls() {
  const { items, add, remove, clear } = useMarkers();

  const handleAdd = () => {
    const offset = () => (Math.random() - 0.5) * 0.1;
    add({
      position: { lon: CENTER.lon + offset(), lat: CENTER.lat + offset() },
      title: `Marker ${items.length + 1}`,
    });
  };

  const handleRemoveLast = () => {
    const last = items.at(-1);
    if (last?.id) {
      remove(last.id);
    }
  };

  return (
    <>
      <SphereMap
        center={CENTER}
        language="en"
        style={{ width: "100%", height: "350px" }}
        zoom={12}
      >
        {items.map((m) => (
          <Marker key={m.id} position={m.position} title={m.title} />
        ))}
      </SphereMap>
      <div className="flex flex-wrap items-center gap-2 bg-fd-card p-3">
        <button
          className="cursor-pointer rounded-md border border-fd-border bg-fd-secondary px-2 text-[0.8125rem] text-fd-secondary-foreground hover:bg-fd-accent disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleAdd}
          type="button"
        >
          Add Marker
        </button>
        <button
          className="cursor-pointer rounded-md border border-fd-border bg-fd-secondary px-2 text-[0.8125rem] text-fd-secondary-foreground hover:bg-fd-accent disabled:cursor-not-allowed disabled:opacity-50"
          disabled={items.length === 0}
          onClick={handleRemoveLast}
          type="button"
        >
          Remove Last
        </button>
        <button
          className="cursor-pointer rounded-md border border-fd-border bg-fd-secondary px-2 text-[0.8125rem] text-fd-secondary-foreground hover:bg-fd-accent disabled:cursor-not-allowed disabled:opacity-50"
          disabled={items.length === 0}
          onClick={clear}
          type="button"
        >
          Clear All
        </button>
        <span className="text-fd-muted-foreground text-xs">
          {items.length} marker{items.length !== 1 ? "s" : ""}
        </span>
      </div>
    </>
  );
}

export function OverlayDemo() {
  if (!API_KEY) {
    return null;
  }

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-fd-border">
      <SphereProvider apiKey={API_KEY}>
        <OverlayControls />
      </SphereProvider>
    </div>
  );
}
