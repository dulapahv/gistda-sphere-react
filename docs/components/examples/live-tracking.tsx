"use client";

import {
  type Location,
  Marker,
  Polyline,
  SphereMap,
  useMapControls,
} from "gistda-sphere-react";
import { useEffect, useState } from "react";

interface Route {
  color: string;
  id: string;
  /** A loop of stops the vehicle drives around. */
  path: Location[];
}

const ROUTES: Route[] = [
  {
    color: "#2563eb",
    id: "Bus 1",
    path: [
      { lat: 13.7563, lon: 100.5018 },
      { lat: 13.7466, lon: 100.5347 },
      { lat: 13.7279, lon: 100.5241 },
      { lat: 13.72, lon: 100.501 },
      { lat: 13.74, lon: 100.49 },
    ],
  },
  {
    color: "#dc2626",
    id: "Bus 2",
    path: [
      { lat: 13.744, lon: 100.548 },
      { lat: 13.738, lon: 100.56 },
      { lat: 13.73, lon: 100.58 },
      { lat: 13.715, lon: 100.59 },
      { lat: 13.723, lon: 100.565 },
    ],
  },
  {
    color: "#16a34a",
    id: "Bus 3",
    path: [
      { lat: 13.8, lon: 100.55 },
      { lat: 13.82, lon: 100.56 },
      { lat: 13.83, lon: 100.58 },
      { lat: 13.81, lon: 100.59 },
      { lat: 13.795, lon: 100.57 },
    ],
  },
];

/** How far a vehicle moves per update, in route segments. */
const SPEED = 0.12;
const UPDATE_MS = 1000;
/** A little under the update interval, so each slide ends before the next. */
const SLIDE_MS = 900;
const TRAIL_LENGTH = 12;

/** Where a vehicle is after `progress` segments along its loop, and which way it faces. */
function positionOn(path: Location[], progress: number) {
  const index = Math.floor(progress) % path.length;
  const from = path[index] as Location;
  const to = path[(index + 1) % path.length] as Location;
  const fraction = progress % 1;
  const position = {
    lat: from.lat + (to.lat - from.lat) * fraction,
    lon: from.lon + (to.lon - from.lon) * fraction,
  };
  // Degrees clockwise from north, as the marker's `rotate` expects.
  const east = (to.lon - from.lon) * Math.cos((from.lat * Math.PI) / 180);
  const heading = (Math.atan2(east, to.lat - from.lat) * 180) / Math.PI;
  return { heading, position };
}

/** Buses that move smoothly, face where they're going, and leave a trail. */
export function LiveTracking() {
  const { setCenter } = useMapControls();
  const [tick, setTick] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [followed, setFollowed] = useState<string | null>(null);

  // Stands in for positions from your server, such as a WebSocket.
  useEffect(() => {
    if (isPaused) {
      return;
    }
    const timer = setInterval(
      () => setTick((previous) => previous + 1),
      UPDATE_MS
    );
    return () => clearInterval(timer);
  }, [isPaused]);

  const vehicles = ROUTES.map((route, index) => {
    const offset = index * 1.5;
    const { heading, position } = positionOn(route.path, offset + tick * SPEED);
    const trail = Array.from(
      { length: TRAIL_LENGTH },
      (_, step) =>
        positionOn(route.path, offset + Math.max(0, tick - step) * SPEED)
          .position
    );
    return { ...route, heading, position, trail };
  });

  const followedPosition = vehicles.find(({ id }) => id === followed)?.position;
  useEffect(() => {
    if (followedPosition) {
      setCenter(followedPosition, true);
    }
  }, [followedPosition, setCenter]);

  return (
    <>
      <SphereMap
        center={{ lat: 13.77, lon: 100.54 }}
        style={{ height: 400 }}
        zoom={11}
      >
        {vehicles.map((vehicle) => (
          <Polyline
            key={`${vehicle.id} trail`}
            lineColor={vehicle.color}
            lineWidth={3}
            positions={vehicle.trail}
          />
        ))}
        {vehicles.map((vehicle) => (
          <Marker
            animate={SLIDE_MS}
            key={vehicle.id}
            position={vehicle.position}
            rotate={vehicle.heading}
            title={vehicle.id}
          >
            <svg aria-hidden="true" height="28" viewBox="0 0 24 24" width="28">
              <path
                d="M12 2 20 21 12 17 4 21z"
                fill={vehicle.color}
                stroke="white"
                strokeWidth="1.5"
              />
            </svg>
          </Marker>
        ))}
      </SphereMap>
      <div className="controls">
        <button onClick={() => setIsPaused(!isPaused)} type="button">
          {isPaused ? "Resume" : "Pause"}
        </button>
        {ROUTES.map(({ id }) => (
          <button
            aria-pressed={followed === id}
            key={id}
            onClick={() => setFollowed(followed === id ? null : id)}
            type="button"
          >
            Follow {id}
          </button>
        ))}
        <small>Updates every second. Following keeps the bus centered.</small>
      </div>
    </>
  );
}
