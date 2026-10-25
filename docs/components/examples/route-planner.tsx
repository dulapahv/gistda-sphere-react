"use client";

import {
  type Location,
  Marker,
  type RouteErrorInfo,
  RouteGuide,
  type RouteMode,
  SphereMap,
  useRoute,
} from "gistda-sphere-react";
import { useState } from "react";

const BANGKOK: Location = { lat: 13.7563, lon: 100.5018 };
const CHIANG_MAI: Location = { lat: 18.7883, lon: 98.9853 };
const MODES: { label: string; mode: RouteMode }[] = [
  { label: "Avoid traffic", mode: "Traffic" },
  { label: "Shortest", mode: "Distance" },
  { label: "Straight line", mode: "Fly" },
];

/** Explains why a route couldn't be planned. */
function describeError(error: RouteErrorInfo): string {
  if (error.code === "timeout") {
    return "The routing service didn't answer. Check that your API key has the routing service enabled, or try Straight line.";
  }
  if (error.code === "exception") {
    return `Sphere couldn't plan the route: ${error.message}`;
  }
  return `Routing failed (status ${error.code}).`;
}

/** Plans Bangkok to Chiang Mai with `useRoute` and lists the directions. */
export function RoutePlanner() {
  const [mode, setMode] = useState<RouteMode>("Traffic");
  const [showGuide, setShowGuide] = useState(false);
  const route = useRoute();
  const { error, isReady, status, steps, summary } = route;

  const plan = () => {
    route.clear();
    route.setMode(mode);
    route.addDestination(BANGKOK);
    route.addDestination(CHIANG_MAI);
    route.search();
  };

  return (
    <>
      <SphereMap
        center={{ lat: 16.27, lon: 99.75 }}
        style={{ height: 400 }}
        zoom={6}
      >
        {/* Sphere draws its own stop markers once a route is planned. */}
        {status === "idle" ? (
          <>
            <Marker position={BANGKOK} title="Bangkok (origin)" />
            <Marker position={CHIANG_MAI} title="Chiang Mai (destination)" />
          </>
        ) : null}
      </SphereMap>
      <div className="controls">
        {MODES.map((option) => (
          <button
            aria-pressed={mode === option.mode}
            key={option.mode}
            onClick={() => setMode(option.mode)}
            type="button"
          >
            {option.label}
          </button>
        ))}
        <button
          disabled={!isReady || status === "calculating"}
          onClick={plan}
          type="button"
        >
          {status === "calculating" ? "Calculating…" : "Plan the route"}
        </button>
        {status === "idle" ? null : (
          <button onClick={() => route.clear()} type="button">
            Clear
          </button>
        )}
        <button
          aria-pressed={showGuide}
          onClick={() => setShowGuide(!showGuide)}
          type="button"
        >
          Sphere's guide
        </button>
        {summary ? (
          <output>
            {summary.distanceText} · {summary.intervalText || "–"}
          </output>
        ) : null}
        {error ? <p role="alert">{describeError(error)}</p> : null}
        {steps.length > 0 ? (
          <ol>
            {steps.map((step, index) => (
              <li key={index}>
                {step.instruction}{" "}
                <small>
                  {[step.distanceText, step.intervalText]
                    .filter(Boolean)
                    .join(" · ")}
                </small>
              </li>
            ))}
          </ol>
        ) : null}
        {showGuide ? <RouteGuide className="panel" /> : null}
      </div>
    </>
  );
}
