"use client";

import { type Location, Marker, SphereMap } from "gistda-sphere-react";
import { useRef, useState } from "react";

interface PlacedMarker {
  id: number;
  position: Location;
}

/** Click the map to place markers, and drag them to move. */
export function MarkerPlacement() {
  const nextId = useRef(0);
  const [markers, setMarkers] = useState<PlacedMarker[]>([]);

  const place = (position: Location) => {
    nextId.current += 1;
    setMarkers((previous) => [...previous, { id: nextId.current, position }]);
  };

  // Keep each moved position in state, so the marker stays where it was dropped.
  const move = (id: number, position: Location) => {
    setMarkers((previous) =>
      previous.map((marker) =>
        marker.id === id ? { ...marker, position } : marker
      )
    );
  };

  return (
    <>
      <SphereMap
        center={{ lat: 13.7563, lon: 100.5018 }}
        onClick={({ lat, lon }) => place({ lat, lon })}
        style={{ height: 400 }}
        zoom={10}
      >
        {markers.map((marker) => (
          <Marker
            draggable
            key={marker.id}
            onDrop={(_, position) => move(marker.id, position)}
            position={marker.position}
            title={`${marker.position.lat.toFixed(4)}, ${marker.position.lon.toFixed(4)}`}
          />
        ))}
      </SphereMap>
      <div className="controls">
        <small>Click the map to place markers, and drag them to move.</small>
        <output>{markers.length} placed</output>
        <button
          disabled={markers.length === 0}
          onClick={() => setMarkers([])}
          type="button"
        >
          Clear
        </button>
      </div>
    </>
  );
}
