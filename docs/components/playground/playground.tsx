"use client";

import { type Location, SphereProvider } from "gistda-sphere-react";
import { useCallback, useState } from "react";
import {
  DrawingPanel,
  LayerSelector,
  MapControlsPanel,
  MapStats,
  MapView,
  QuickNav,
  RoutePanel,
  SearchPanel,
  Sidebar,
  TagsPanel,
} from "./components";
import { useDrawing, useMapSettings } from "./hooks";
import "./playground.css";
import type { SearchMarkerData } from "./types";

const API_KEY = process.env.NEXT_PUBLIC_SPHERE_API_KEY ?? "";

/** Main playground content with sidebar and map. */
function PlaygroundContent() {
  const mapSettings = useMapSettings();
  const drawing = useDrawing();
  const { handleClick: drawingClick } = drawing;
  const { navigateTo } = mapSettings;

  const [searchMarker, setSearchMarker] = useState<SearchMarkerData | null>(
    null
  );
  const [routeOrigin, setRouteOrigin] = useState<Location | null>(null);
  const [routeDestination, setRouteDestination] = useState<Location | null>(
    null
  );
  const [settingRoutePoint, setSettingRoutePoint] = useState<
    "origin" | "destination" | null
  >(null);

  const handleMapClick = useCallback(
    (location: Location) => {
      if (settingRoutePoint === "origin") {
        setRouteOrigin(location);
        setSettingRoutePoint(null);
        return;
      }
      if (settingRoutePoint === "destination") {
        setRouteDestination(location);
        setSettingRoutePoint(null);
        return;
      }
      drawingClick(location);
    },
    [settingRoutePoint, drawingClick]
  );

  const handleSearchResult = useCallback(
    (marker: SearchMarkerData) => {
      setSearchMarker(marker);
      navigateTo(marker.position, 16);
    },
    [navigateTo]
  );

  return (
    <div className="pg-container">
      <Sidebar>
        <MapStats
          center={mapSettings.center}
          totalShapes={drawing.totalShapes}
          zoom={mapSettings.zoom}
        />

        <LayerSelector
          activeOverlays={mapSettings.activeOverlays}
          activePredefined={mapSettings.activePredefined}
          currentLayer={mapSettings.currentLayer}
          onLayerChange={mapSettings.setLayer}
          onOverlayToggle={mapSettings.toggleOverlay}
          onPredefinedToggle={mapSettings.togglePredefined}
        />

        <MapControlsPanel
          mapReady={mapSettings.mapReady}
          onToggle={mapSettings.toggleUiControl}
          uiControls={mapSettings.uiControls}
        />

        <QuickNav onNavigate={mapSettings.navigateTo} />

        <div className="pg-section-divider" />

        <DrawingPanel
          mode={drawing.mode}
          onClear={drawing.clearAll}
          onModeChange={drawing.setMode}
        />

        <div className="pg-section-divider" />

        <SearchPanel onResultSelect={handleSearchResult} />

        <div className="pg-section-divider" />

        <RoutePanel
          destination={routeDestination}
          onSetDestination={setRouteDestination}
          onSetOrigin={setRouteOrigin}
          onSettingPointChange={setSettingRoutePoint}
          origin={routeOrigin}
          settingPoint={settingRoutePoint}
        />

        <div className="pg-section-divider" />

        <TagsPanel />
      </Sidebar>

      <MapView
        center={mapSettings.center}
        drawing={drawing}
        onClick={handleMapClick}
        onDoubleClick={drawing.handleDoubleClick}
        onLocation={mapSettings.setCenter}
        onZoom={mapSettings.setZoom}
        routeDestination={routeDestination}
        routeOrigin={routeOrigin}
        searchMarker={searchMarker}
        settingRoutePoint={settingRoutePoint}
      />
    </div>
  );
}

/**
 * Standalone full-page playground component.
 * Renders at 100vh without docs chrome.
 */
export function StandalonePlayground() {
  if (!API_KEY) {
    return (
      <div className="pg-error-screen">
        <p>
          Set <code>NEXT_PUBLIC_SPHERE_API_KEY</code> in{" "}
          <code>docs/.env.local</code> to use the playground.
        </p>
      </div>
    );
  }

  return (
    <SphereProvider apiKey={API_KEY}>
      <PlaygroundContent />
    </SphereProvider>
  );
}
