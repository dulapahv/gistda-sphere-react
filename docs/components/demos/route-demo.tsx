"use client";

import {
  type Location,
  Marker,
  type RouteGuideStep,
  SphereMap,
  SphereProvider,
  useRoute,
} from "gistda-sphere-react";
import { useCallback, useEffect, useState } from "react";
import { useDocLanguage } from "./use-doc-language";

const API_KEY = process.env.NEXT_PUBLIC_SPHERE_API_KEY ?? "";

const BANGKOK: Location = { lon: 100.5018, lat: 13.7563 };
const CHIANG_MAI: Location = { lon: 98.9853, lat: 18.7883 };

function RouteControls() {
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    time: string;
  } | null>(null);
  const [guide, setGuide] = useState<RouteGuideStep[]>([]);
  const [showGuide, setShowGuide] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [routeCompleted, setRouteCompleted] = useState(false);
  const language = useDocLanguage();

  const handleRouteComplete = useCallback(() => {
    setCalculating(false);
    setRouteCompleted(true);
  }, []);

  const handleRouteError = useCallback(() => {
    setCalculating(false);
    setRouteInfo(null);
    setGuide([]);
  }, []);

  const {
    addDestination,
    search,
    getDistance,
    getInterval,
    getGuide,
    clear,
    clearDestinations,
    clearPath,
    isReady,
  } = useRoute({
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

    const steps = getGuide();
    if (Array.isArray(steps) && steps.length > 0) {
      setGuide(steps as RouteGuideStep[]);
    }
  }, [routeCompleted, getDistance, getInterval, getGuide]);

  const handleCalculate = () => {
    setCalculating(true);
    setRouteInfo(null);
    setGuide([]);
    setShowGuide(false);
    clearDestinations();
    clearPath();
    addDestination(BANGKOK);
    addDestination(CHIANG_MAI);
    search();
  };

  const handleClear = () => {
    clear();
    setRouteInfo(null);
    setGuide([]);
    setShowGuide(false);
    setCalculating(false);
  };

  return (
    <>
      <SphereMap
        center={{ lon: 99.75, lat: 16.27 }}
        language={language}
        style={{ width: "100%", height: "400px" }}
        zoom={7}
      >
        <Marker position={BANGKOK} title="Bangkok (Origin)" />
        <Marker position={CHIANG_MAI} title="Chiang Mai (Destination)" />
      </SphereMap>
      <div className="flex flex-col gap-2 bg-fd-card p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="py-2 text-fd-muted-foreground text-sm">
            Bangkok → Chiang Mai
          </span>
          <button
            className="cursor-pointer rounded-md border border-fd-primary bg-fd-primary px-2 py-1.5 text-fd-primary-foreground text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isReady || calculating}
            onClick={handleCalculate}
            type="button"
          >
            {calculating ? "Calculating..." : "Calculate Route"}
          </button>
          {routeInfo && (
            <>
              <button
                className={`cursor-pointer rounded-md border px-2 py-1.5 text-xs transition-colors ${
                  showGuide
                    ? "border-fd-primary bg-fd-primary text-fd-primary-foreground"
                    : "border-fd-border bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent"
                }`}
                onClick={() => setShowGuide(!showGuide)}
                type="button"
              >
                {showGuide ? "Hide Directions" : "Turn-by-Turn"}
              </button>
              <button
                className="cursor-pointer rounded-md border border-fd-border bg-fd-secondary px-2 py-1.5 text-fd-secondary-foreground text-xs transition-colors hover:bg-fd-accent"
                onClick={handleClear}
                type="button"
              >
                Clear
              </button>
            </>
          )}
        </div>
        {routeInfo && (
          <div className="rounded-md border border-fd-border bg-fd-muted px-2 py-1.5">
            <div className="flex justify-between py-1 text-xs">
              <span className="text-fd-muted-foreground">Distance</span>
              <span className="font-medium text-fd-foreground">
                {routeInfo.distance}
              </span>
            </div>
            <div className="flex justify-between py-1 text-xs">
              <span className="text-fd-muted-foreground">Duration</span>
              <span className="font-medium text-fd-foreground">
                {routeInfo.time}
              </span>
            </div>
          </div>
        )}
        {showGuide && guide.length > 0 && (
          <div className="max-h-50 overflow-y-auto rounded-md border border-fd-border bg-fd-muted">
            {guide.map((step, i) => (
              <div
                className="flex items-start gap-2 border-fd-border border-b px-2 py-1.5 last:border-b-0"
                key={`step-${step.instruction}-${String(step.distance)}`}
              >
                <span className="shrink-0 font-medium text-fd-muted-foreground text-xs">
                  {i + 1}.
                </span>
                <div className="flex-1 py-2 text-sm">
                  <p className="text-fd-foreground">{step.instruction}</p>
                  <p className="text-fd-muted-foreground text-xs">
                    {String(step.distance)}
                    {step.duration ? ` · ${String(step.duration)}` : ""}
                  </p>
                </div>
              </div>
            ))}
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
