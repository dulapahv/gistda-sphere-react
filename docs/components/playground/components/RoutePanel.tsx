"use client";

import type { Location } from "gistda-sphere-react";
import { useRoute } from "gistda-sphere-react";
import { ArrowLeftRight, MapPin, Route, Trash2 } from "lucide-react";
import { useState } from "react";
import { ROUTE_MODES, type RouteMode } from "../constants";
import type { RouteInfoData } from "../types";
import "./RoutePanel.css";

interface RoutePanelProps {
  origin: Location | null;
  destination: Location | null;
  settingPoint: "origin" | "destination" | null;
  onSetOrigin: (location: Location | null) => void;
  onSetDestination: (location: Location | null) => void;
  onSettingPointChange: (point: "origin" | "destination" | null) => void;
}

/** Route planning panel with origin/destination selection and mode picker. */
export function RoutePanel({
  origin,
  destination,
  settingPoint,
  onSetOrigin,
  onSetDestination,
  onSettingPointChange,
}: RoutePanelProps) {
  const {
    addDestination,
    search: searchRoute,
    getDistance,
    getInterval,
    clear: clearRoute,
    reverse,
    setMode,
    isReady,
  } = useRoute();

  const [routeMode, setRouteMode] = useState<RouteMode>("Traffic");
  const [routeInfo, setRouteInfo] = useState<RouteInfoData | null>(null);

  const handleCalculateRoute = () => {
    if (!(origin && destination && isReady)) {
      return;
    }
    clearRoute();
    setMode(routeMode);
    addDestination(origin);
    addDestination(destination);
    searchRoute();
    setTimeout(() => {
      const distance = getDistance(true);
      const time = getInterval(true);
      setRouteInfo({
        distance: distance ? String(distance) : "-",
        time: time ? String(time) : "-",
      });
    }, 1500);
  };

  const handleReverseRoute = () => {
    if (!(origin && destination)) {
      return;
    }
    onSetOrigin(destination);
    onSetDestination(origin);
    reverse();
    searchRoute();
    setTimeout(() => {
      setRouteInfo({
        distance: String(getDistance(true) ?? "-"),
        time: String(getInterval(true) ?? "-"),
      });
    }, 1500);
  };

  const handleClearRoute = () => {
    clearRoute();
    onSetOrigin(null);
    onSetDestination(null);
    setRouteInfo(null);
  };

  const toggleSettingPoint = (point: "origin" | "destination") => {
    onSettingPointChange(settingPoint === point ? null : point);
  };

  return (
    <div className="pg-panel-section">
      <div className="pg-section-header">Route Planning</div>
      <div className="pg-route-points">
        <div className="pg-route-point">
          <span className="pg-route-label">Origin</span>
          <span className={`pg-route-coord ${origin ? "" : "muted"}`}>
            {origin
              ? `${origin.lat.toFixed(4)}, ${origin.lon.toFixed(4)}`
              : "Not set"}
          </span>
          <button
            aria-label="Set origin on map"
            className={`pg-btn pg-btn-sm ${settingPoint === "origin" ? "pg-btn-primary" : ""}`}
            onClick={() => toggleSettingPoint("origin")}
            type="button"
          >
            <MapPin size={14} />
          </button>
        </div>
        <div className="pg-route-point">
          <span className="pg-route-label">Destination</span>
          <span className={`pg-route-coord ${destination ? "" : "muted"}`}>
            {destination
              ? `${destination.lat.toFixed(4)}, ${destination.lon.toFixed(4)}`
              : "Not set"}
          </span>
          <button
            aria-label="Set destination on map"
            className={`pg-btn pg-btn-sm ${settingPoint === "destination" ? "pg-btn-primary" : ""}`}
            onClick={() => toggleSettingPoint("destination")}
            type="button"
          >
            <MapPin size={14} />
          </button>
        </div>
      </div>

      {settingPoint && (
        <p className="pg-tool-hint">Click on the map to set {settingPoint}</p>
      )}

      <div className="pg-route-modes">
        {ROUTE_MODES.map((mode) => (
          <button
            className={`pg-btn pg-btn-sm ${routeMode === mode.id ? "pg-btn-primary" : ""}`}
            key={mode.id}
            onClick={() => setRouteMode(mode.id)}
            type="button"
          >
            <mode.icon size={14} />
            {mode.label}
          </button>
        ))}
      </div>

      <div className="pg-button-row">
        <button
          className="pg-btn pg-btn-primary"
          disabled={!(origin && destination && isReady)}
          onClick={handleCalculateRoute}
          type="button"
        >
          <Route size={14} /> Calculate
        </button>
        <button
          aria-label="Reverse route"
          className="pg-btn pg-btn-sm"
          disabled={!(origin && destination)}
          onClick={handleReverseRoute}
          type="button"
        >
          <ArrowLeftRight size={14} />
        </button>
        <button
          aria-label="Clear route"
          className="pg-btn pg-btn-sm"
          onClick={handleClearRoute}
          type="button"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {routeInfo && (
        <div className="pg-route-info">
          <div className="pg-info-row">
            <span className="pg-info-label">Distance</span>
            <span className="pg-info-value">{routeInfo.distance}</span>
          </div>
          <div className="pg-info-row">
            <span className="pg-info-label">Duration</span>
            <span className="pg-info-value">{routeInfo.time}</span>
          </div>
        </div>
      )}
    </div>
  );
}
