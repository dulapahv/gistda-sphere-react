"use client";

import {
  Dot,
  type Location,
  Polygon,
  Polyline,
  SphereMap,
} from "gistda-sphere-react";
import { useRef, useState } from "react";

interface Corner {
  id: number;
  location: Location;
}

interface Shape {
  corners: Location[];
  id: number;
}

/** Drops repeated corners, such as the two clicks of a double-click. */
function withoutRepeats(corners: Corner[]): Corner[] {
  return corners.filter((corner, index) => {
    const previous = corners[index - 1]?.location;
    return (
      previous?.lat !== corner.location.lat ||
      previous?.lon !== corner.location.lon
    );
  });
}

/** Click to add corners, then double-click or press Finish to close a polygon. */
export function PolygonDrawing() {
  const nextId = useRef(0);
  const [corners, setCorners] = useState<Corner[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const pending = withoutRepeats(corners);
  const outline = pending.map((corner) => corner.location);

  const addCorner = (location: Location) => {
    nextId.current += 1;
    setCorners((previous) => [...previous, { id: nextId.current, location }]);
  };

  const finish = () => {
    if (outline.length < 3) {
      return;
    }
    nextId.current += 1;
    setShapes((previous) => [
      ...previous,
      { corners: outline, id: nextId.current },
    ]);
    setCorners([]);
  };

  return (
    <>
      <SphereMap
        center={{ lat: 13.75, lon: 100.5 }}
        onClick={({ lat, lon }) => addCorner({ lat, lon })}
        onDoubleClick={finish}
        // Keep double-clicks for finishing shapes instead of zooming in.
        options={{ doubleClickZoom: false }}
        style={{ height: 400 }}
        zoom={10}
      >
        {shapes.map((shape, index) => (
          <Polygon
            fillColor="rgba(255, 0, 0, 0.3)"
            key={shape.id}
            lineColor="red"
            lineWidth={2}
            positions={shape.corners}
            title={`Polygon ${index + 1}`}
          />
        ))}
        {outline.length >= 2 ? (
          <Polyline
            lineColor="rgba(255, 0, 0, 0.6)"
            lineStyle="Dashed"
            lineWidth={2}
            positions={[...outline, ...outline.slice(0, 1)]}
          />
        ) : null}
        {pending.map((corner) => (
          <Dot
            key={corner.id}
            lineColor="red"
            lineWidth={8}
            position={corner.location}
          />
        ))}
      </SphereMap>
      <div className="controls">
        <small>Click to add corners, then double-click or press Finish.</small>
        <button disabled={outline.length < 3} onClick={finish} type="button">
          Finish
        </button>
        <button
          onClick={() => {
            setCorners([]);
            setShapes([]);
          }}
          type="button"
        >
          Clear
        </button>
        <output>{shapes.length} drawn</output>
      </div>
    </>
  );
}
