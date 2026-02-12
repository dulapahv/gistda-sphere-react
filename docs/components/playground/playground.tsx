"use client";

import { type Location, SphereProvider } from "gistda-sphere-react";
import { useCallback, useState } from "react";
import {
  DrawingPanel,
  LanguageSelector,
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
import { getTranslations } from "./translations";
import type { SearchMarkerData } from "./types";

const API_KEY = process.env.NEXT_PUBLIC_SPHERE_API_KEY ?? "";

interface PlaygroundContentProps {
  lang: string;
}

function PlaygroundContent({ lang }: PlaygroundContentProps) {
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
    <div className="flex h-screen w-full overflow-hidden bg-fd-background font-sans text-[13px] text-fd-foreground max-md:flex-col">
      <Sidebar lang={lang}>
        <MapStats
          center={mapSettings.center}
          lang={lang}
          totalShapes={drawing.totalShapes}
          zoom={mapSettings.zoom}
        />

        <LayerSelector
          activeOverlays={mapSettings.activeOverlays}
          activePredefined={mapSettings.activePredefined}
          currentLayer={mapSettings.currentLayer}
          lang={lang}
          onLayerChange={mapSettings.setLayer}
          onOverlayToggle={mapSettings.toggleOverlay}
          onPredefinedToggle={mapSettings.togglePredefined}
        />

        <MapControlsPanel
          lang={lang}
          mapReady={mapSettings.mapReady}
          onToggle={mapSettings.toggleUiControl}
          uiControls={mapSettings.uiControls}
        />

        <LanguageSelector
          lang={lang}
          language={mapSettings.language}
          onLanguageChange={mapSettings.setLanguage}
        />

        <QuickNav lang={lang} onNavigate={mapSettings.navigateTo} />

        <div className="my-4 h-px bg-fd-border" />

        <DrawingPanel
          lang={lang}
          mode={drawing.mode}
          onClear={drawing.clearAll}
          onModeChange={drawing.setMode}
        />

        <div className="my-4 h-px bg-fd-border" />

        <SearchPanel lang={lang} onResultSelect={handleSearchResult} />

        <div className="my-4 h-px bg-fd-border" />

        <RoutePanel
          destination={routeDestination}
          lang={lang}
          onSetDestination={setRouteDestination}
          onSetOrigin={setRouteOrigin}
          onSettingPointChange={setSettingRoutePoint}
          origin={routeOrigin}
          settingPoint={settingRoutePoint}
        />

        <div className="my-4 h-px bg-fd-border" />

        <TagsPanel lang={lang} />
      </Sidebar>

      <MapView
        center={mapSettings.center}
        drawing={drawing}
        lang={lang}
        language={mapSettings.language}
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

interface StandalonePlaygroundProps {
  lang: string;
}

export function StandalonePlayground({ lang }: StandalonePlaygroundProps) {
  const t = getTranslations(lang);

  if (!API_KEY) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-fd-background p-8 text-center text-fd-foreground">
        <p className="text-fd-secondary-foreground text-sm">{t.apiKeyError}</p>
      </div>
    );
  }

  return (
    <SphereProvider apiKey={API_KEY}>
      <PlaygroundContent lang={lang} />
    </SphereProvider>
  );
}
