"use client";

import {
  type Location,
  Marker,
  SphereMap,
  SphereProvider,
  useRoute,
} from "gistda-sphere-react";
import { useCallback, useEffect, useState } from "react";

const API_KEY = process.env.NEXT_PUBLIC_SPHERE_API_KEY ?? "";

const BANGKOK: Location = { lon: 100.5018, lat: 13.7563 };
const CHIANG_MAI: Location = { lon: 98.9853, lat: 18.7883 };

function RouteControls() {
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    time: string;
  } | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [routeCompleted, setRouteCompleted] = useState(false);

  const handleRouteComplete = useCallback(() => {
    setCalculating(false);
    setRouteCompleted(true);
  }, []);

  const handleRouteError = useCallback(() => {
    setCalculating(false);
    setRouteInfo(null);
  }, []);

  const { addDestination, search, getDistance, getInterval, clear, isReady } =
    useRoute({
      onRouteComplete: handleRouteComplete,
      onRouteError: handleRouteError,
    });

  useEffect(() => {
    if (!routeCompleted) {
      return;
    }

    setRouteCompleted(false);

    const dist = getDistance(true);
    const time = getInterval(true);
    if (dist && dist !== 0 && dist !== "0") {
      setRouteInfo({
        distance: String(dist),
        time: String(time ?? "-"),
      });
    }
  }, [routeCompleted, getDistance, getInterval]);

  const handleCalculate = () => {
    setCalculating(true);
    setRouteInfo(null);
    clear();
    addDestination(BANGKOK);
    addDestination(CHIANG_MAI);
    search();
  };

  const handleClear = () => {
    clear();
    setRouteInfo(null);
    setCalculating(false);
  };

  return (
    <>
      <SphereMap
        center={{ lon: 99.75, lat: 16.27 }}
        language="en"
        style={{ width: "100%", height: "400px" }}
        zoom={7}
      >
        <Marker position={BANGKOK} title="Bangkok (Origin)" />
        <Marker position={CHIANG_MAI} title="Chiang Mai (Destination)" />
      </SphereMap>
      <div className="flex flex-col gap-2 bg-fd-card p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.8125rem] text-fd-muted-foreground">
            Bangkok → Chiang Mai
          </span>
          <button
            className="cursor-pointer rounded-md border border-fd-primary bg-fd-primary px-2 text-[0.8125rem] text-fd-primary-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isReady || calculating}
            onClick={handleCalculate}
            type="button"
          >
            {calculating ? "Calculating..." : "Calculate Route"}
          </button>
          {routeInfo && (
            <button
              className="cursor-pointer rounded-md border border-fd-border bg-fd-secondary px-2 text-[0.8125rem] text-fd-secondary-foreground transition-colors hover:bg-fd-accent"
              onClick={handleClear}
              type="button"
            >
              Clear
            </button>
          )}
        </div>
        {routeInfo && (
          <div className="rounded-md border border-fd-border bg-fd-muted px-3 py-2">
            <div className="flex justify-between py-1 text-[0.8125rem]">
              <span className="text-fd-muted-foreground">Distance</span>
              <span className="font-medium text-fd-foreground">
                {routeInfo.distance}
              </span>
            </div>
            <div className="flex justify-between py-1 text-[0.8125rem]">
              <span className="text-fd-muted-foreground">Duration</span>
              <span className="font-medium text-fd-foreground">
                {routeInfo.time}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function RouteDemo() {
  if (!API_KEY) {
    return null;
  }

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-fd-border">
      <SphereProvider apiKey={API_KEY}>
        <RouteControls />
      </SphereProvider>
    </div>
  );
}
