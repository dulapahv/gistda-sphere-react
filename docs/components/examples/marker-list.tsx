"use client";

import { Marker, SphereMap, useMarkers } from "gistda-sphere-react";

const CENTER = { lat: 13.7563, lon: 100.5018 };

/** Markers kept as a list with `useMarkers`. */
export function MarkerList() {
  const { items, add, remove, clear } = useMarkers();

  const addRandom = () => {
    const offset = () => (Math.random() - 0.5) * 0.1;
    add({
      position: { lat: CENTER.lat + offset(), lon: CENTER.lon + offset() },
      title: `Marker ${items.length + 1}`,
    });
  };

  const removeLast = () => {
    const last = items.at(-1);
    if (last) {
      remove(last.id);
    }
  };

  return (
    <>
      <SphereMap center={CENTER} style={{ height: 350 }} zoom={12}>
        {items.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            title={marker.title}
          />
        ))}
      </SphereMap>
      <div className="controls">
        <button onClick={addRandom} type="button">
          Add marker
        </button>
        <button
          disabled={items.length === 0}
          onClick={removeLast}
          type="button"
        >
          Remove last
        </button>
        <button
          disabled={items.length === 0}
          onClick={() => clear()}
          type="button"
        >
          Clear all
        </button>
        <output>{items.length} markers</output>
      </div>
    </>
  );
}
