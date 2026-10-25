"use client";

import {
  type Location,
  Marker,
  MarkerCluster,
  SphereMap,
} from "gistda-sphere-react";
import { useMemo, useState } from "react";

interface Place {
  id: number;
  position: Location;
}

const BANGKOK = { lat: 13.7563, lon: 100.5018 };
const COUNTS = [200, 1000, 5000];

/** Pseudo-random numbers from a fixed seed, so the sample points never move. */
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    return state / 4_294_967_296;
  };
}

/** Sample points around Bangkok, denser toward the center. */
function createPlaces(count: number): Place[] {
  const random = seededRandom(7);
  return Array.from({ length: count }, (_, id) => {
    const distance = random() ** 2 * 0.35;
    const angle = random() * 2 * Math.PI;
    return {
      id,
      position: {
        lat: BANGKOK.lat + distance * Math.sin(angle),
        lon: BANGKOK.lon + distance * Math.cos(angle),
      },
    };
  });
}

/** Thousands of points as markers, grouped into clusters until users zoom in. */
export function ClusteredPlaces() {
  const [count, setCount] = useState(1000);
  const places = useMemo(() => createPlaces(count), [count]);

  return (
    <>
      <SphereMap center={BANGKOK} style={{ height: 400 }} zoom={10}>
        <MarkerCluster
          getPosition={(place) => place.position}
          items={places}
          renderMarker={(place) => (
            <Marker position={place.position} title={`Place ${place.id + 1}`} />
          )}
        />
      </SphereMap>
      <div className="controls">
        {COUNTS.map((option) => (
          <button
            aria-pressed={count === option}
            key={option}
            onClick={() => setCount(option)}
            type="button"
          >
            {option.toLocaleString("en-US")} points
          </button>
        ))}
        <small>Click a cluster to zoom in to its points.</small>
      </div>
    </>
  );
}
