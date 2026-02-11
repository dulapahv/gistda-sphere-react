"use client";

import type { Location, RouteGuideStep } from "gistda-sphere-react";
import { useRoute } from "gistda-sphere-react";
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  Route,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ROUTE_MODES, type RouteMode } from "../constants";
import { getTranslations, type PlaygroundTranslations } from "../translations";
import type { RouteInfoData } from "../types";

/** Returns the localized label for a route mode. */
function routeModeLabel(t: PlaygroundTranslations, id: RouteMode): string {
  const map: Record<RouteMode, string> = {
    Traffic: t.modeTraffic,
    Distance: t.modeShortest,
    Cost: t.modeCheapest,
  };
  return map[id];
}

interface RoutePanelProps {
  origin: Location | null;
  destination: Location | null;
  settingPoint: "origin" | "destination" | null;
  onSetOrigin: (location: Location | null) => void;
  onSetDestination: (location: Location | null) => void;
  onSettingPointChange: (point: "origin" | "destination" | null) => void;
  lang: string;
}

/** Route planning panel with origin/destination selection and mode picker. */
export function RoutePanel({
  origin,
  destination,
  settingPoint,
  onSetOrigin,
  onSetDestination,
  onSettingPointChange,
  lang,
}: RoutePanelProps) {
  const t = getTranslations(lang);
  const [routeMode, setRouteMode] = useState<RouteMode>("Traffic");
  const [routeInfo, setRouteInfo] = useState<RouteInfoData | null>(null);
  const [guide, setGuide] = useState<RouteGuideStep[]>([]);
  const [showGuide, setShowGuide] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [routeCompleted, setRouteCompleted] = useState(false);

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
    search: searchRoute,
    getDistance,
    getInterval,
    getGuide,
    clear: clearRoute,
    clearDestinations,
    clearPath,
    reverse,
    setMode,
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
      setRouteInfo({ distance: String(dist), time: String(time || "-") });
    }

    const steps = getGuide();
    if (Array.isArray(steps) && steps.length > 0) {
      setGuide(steps as RouteGuideStep[]);
    }
  }, [routeCompleted, getDistance, getInterval, getGuide]);

  const handleCalculateRoute = () => {
    if (!(origin && destination && isReady)) {
      return;
    }
    setCalculating(true);
    setGuide([]);
    setShowGuide(false);
    clearDestinations();
    clearPath();
    setMode(routeMode);
    addDestination(origin);
    addDestination(destination);
    searchRoute();
  };

  const handleReverseRoute = () => {
    if (!(origin && destination)) {
      return;
    }
    onSetOrigin(destination);
    onSetDestination(origin);
    setCalculating(true);
    setGuide([]);
    setShowGuide(false);
    reverse();
    searchRoute();
  };

  const handleClearRoute = () => {
    clearRoute();
    onSetOrigin(null);
    onSetDestination(null);
    setRouteInfo(null);
    setGuide([]);
    setShowGuide(false);
  };

  const toggleSettingPoint = (point: "origin" | "destination") => {
    onSettingPointChange(settingPoint === point ? null : point);
  };

  /** Returns the localized label for a setting point type. */
  const pointLabel = (point: "origin" | "destination"): string =>
    point === "origin" ? t.origin : t.destination;

  return (
    <div className="mb-4">
      <div className="mb-2.5 font-semibold text-[11px] text-fd-muted-foreground uppercase tracking-wider">
        {t.routePlanning}
      </div>
      <div className="mb-3 flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-md border border-fd-border bg-fd-secondary px-2.5 py-2">
          <span className="w-17.5 shrink-0 font-semibold text-[11px] text-fd-secondary-foreground">
            {t.origin}
          </span>
          <span
            className={`flex-1 text-[11px] tabular-nums ${origin ? "text-fd-foreground" : "text-fd-muted-foreground"}`}
          >
            {origin
              ? `${origin.lat.toFixed(4)}, ${origin.lon.toFixed(4)}`
              : t.notSet}
          </span>
          <button
            aria-label={t.setOriginOnMap}
            className={`inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1.5 font-medium text-xs ${
              settingPoint === "origin"
                ? "border-fd-primary bg-fd-primary text-fd-primary-foreground hover:border-white hover:bg-white"
                : "border-fd-border bg-fd-secondary text-fd-foreground hover:border-fd-ring hover:bg-fd-accent"
            }`}
            onClick={() => toggleSettingPoint("origin")}
            type="button"
          >
            <MapPin size={14} />
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-fd-border bg-fd-secondary px-2.5 py-2">
          <span className="w-17.5 shrink-0 font-semibold text-[11px] text-fd-secondary-foreground">
            {t.destination}
          </span>
          <span
            className={`flex-1 text-[11px] tabular-nums ${destination ? "text-fd-foreground" : "text-fd-muted-foreground"}`}
          >
            {destination
              ? `${destination.lat.toFixed(4)}, ${destination.lon.toFixed(4)}`
              : t.notSet}
          </span>
          <button
            aria-label={t.setDestinationOnMap}
            className={`inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1.5 font-medium text-xs ${
              settingPoint === "destination"
                ? "border-fd-primary bg-fd-primary text-fd-primary-foreground hover:border-white hover:bg-white"
                : "border-fd-border bg-fd-secondary text-fd-foreground hover:border-fd-ring hover:bg-fd-accent"
            }`}
            onClick={() => toggleSettingPoint("destination")}
            type="button"
          >
            <MapPin size={14} />
          </button>
        </div>
      </div>

      {settingPoint && (
        <p className="mt-2 text-fd-secondary-foreground text-xs">
          {t.clickMapToSet(pointLabel(settingPoint))}
        </p>
      )}

      <div className="mb-3 flex gap-1.5">
        {ROUTE_MODES.map((mode) => (
          <button
            className={`inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1.5 font-medium text-xs ${
              routeMode === mode.id
                ? "border-fd-primary bg-fd-primary text-fd-primary-foreground hover:border-white hover:bg-white"
                : "border-fd-border bg-fd-secondary text-fd-foreground hover:border-fd-ring hover:bg-fd-accent"
            }`}
            key={mode.id}
            onClick={() => setRouteMode(mode.id)}
            type="button"
          >
            <mode.icon size={14} />
            {routeModeLabel(t, mode.id)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-fd-primary bg-fd-primary px-2 py-1.5 font-medium text-fd-primary-foreground text-xs hover:border-white hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!(origin && destination && isReady) || calculating}
          onClick={handleCalculateRoute}
          type="button"
        >
          <Route size={14} /> {calculating ? t.calculating : t.calculate}
        </button>
        <button
          aria-label={t.reverseRoute}
          className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-fd-border bg-fd-secondary px-2.5 py-1.5 font-medium text-fd-foreground text-xs hover:border-fd-ring hover:bg-fd-accent disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!(origin && destination)}
          onClick={handleReverseRoute}
          type="button"
        >
          <ArrowLeftRight size={14} />
        </button>
        <button
          aria-label={t.clearRoute}
          className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-fd-border bg-fd-secondary px-2.5 py-1.5 font-medium text-fd-foreground text-xs hover:border-fd-ring hover:bg-fd-accent"
          onClick={handleClearRoute}
          type="button"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {routeInfo && (
        <div className="mt-3 rounded-md border border-fd-border bg-fd-secondary px-2 py-1.5">
          <div className="flex justify-between py-1 text-xs">
            <span className="text-fd-secondary-foreground">{t.distance}</span>
            <span className="font-medium text-fd-foreground">
              {routeInfo.distance}
            </span>
          </div>
          <div className="flex justify-between py-1 text-xs">
            <span className="text-fd-secondary-foreground">{t.duration}</span>
            <span className="font-medium text-fd-foreground">
              {routeInfo.time}
            </span>
          </div>
          {guide.length > 0 && (
            <button
              className="mt-1 flex w-full cursor-pointer items-center justify-center gap-1 rounded border border-fd-border bg-fd-muted px-2 py-1 text-fd-muted-foreground text-xs hover:text-fd-foreground"
              onClick={() => setShowGuide(!showGuide)}
              type="button"
            >
              {showGuide ? (
                <>
                  {t.hideDirections} <ChevronUp size={12} />
                </>
              ) : (
                <>
                  {t.turnByTurn(guide.length)} <ChevronDown size={12} />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {showGuide && guide.length > 0 && (
        <div className="mt-2 max-h-60 overflow-y-auto rounded-md border border-fd-border bg-fd-muted">
          {guide.map((step, i) => (
            <div
              className="flex items-start gap-2 border-fd-border border-b px-2 py-1.5 last:border-b-0"
              key={`step-${step.instruction}-${String(step.distance)}`}
            >
              <span className="shrink-0 font-medium text-[11px] text-fd-muted-foreground">
                {i + 1}.
              </span>
              <div className="flex-1">
                <p className="text-[11px] text-fd-foreground">
                  {step.instruction}
                </p>
                <p className="text-[10px] text-fd-muted-foreground">
                  {String(step.distance)}
                  {step.duration ? ` · ${String(step.duration)}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
