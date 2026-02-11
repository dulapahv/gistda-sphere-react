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
import { LANGUAGES, type MapLanguage } from "./constants";
import { useDrawing, useMapSettings } from "./hooks";
import { getTranslations } from "./translations";
import type { SearchMarkerData } from "./types";

const API_KEY = process.env.NEXT_PUBLIC_SPHERE_API_KEY ?? "";

interface PlaygroundContentProps {
  lang: string;
}

/** Main playground content with sidebar and map. */
function PlaygroundContent({ lang }: PlaygroundContentProps) {
  const t = getTranslations(lang);
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

        <div className="flex flex-col gap-1.5">
          <span className="font-medium text-[11px] text-fd-muted-foreground uppercase tracking-wider">
            {t.language}
          </span>
          <div className="flex gap-1">
            {LANGUAGES.map((mapLang) => (
              <button
                className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors ${
                  mapSettings.language === mapLang.id
                    ? "border-fd-primary bg-fd-primary/10 text-fd-primary"
                    : "border-fd-border hover:bg-fd-accent"
                }`}
                key={mapLang.id}
                onClick={() =>
                  mapSettings.setLanguage(mapLang.id as MapLanguage)
                }
                type="button"
              >
                <mapLang.icon className="size-3.5" />
                {mapLang.label}
              </button>
            ))}
          </div>
        </div>

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

/**
 * Standalone full-page playground component.
 * Renders at 100vh without docs chrome.
 */
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
