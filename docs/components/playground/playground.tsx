"use client";

import { IconContext, type IconProps } from "@phosphor-icons/react";
import {
  type Language,
  type Location,
  type PoiResult,
  SphereProvider,
  useRoute,
} from "gistda-sphere-react";
import { useState } from "react";
import { MapView } from "./components/MapView";
import { Sidebar } from "./components/Sidebar";
import { DataTab } from "./components/tabs/DataTab";
import { DrawTab } from "./components/tabs/DrawTab";
import { EventsTab } from "./components/tabs/EventsTab";
import { MapTab } from "./components/tabs/MapTab";
import { PlacesTab } from "./components/tabs/PlacesTab";
import { RouteTab } from "./components/tabs/RouteTab";
import { LOCATIONS, type MapLanguage, type TabId } from "./constants";
import { useDrawing, useEventLog, useMapSettings } from "./hooks";
import { getTranslations } from "./translations";
import type { GeoJsonLayer, PickMode, SelectedPlace } from "./types";

const API_KEY = process.env.NEXT_PUBLIC_SPHERE_API_KEY ?? "";

/** Defaults for every Phosphor icon in the playground. */
const ICON_DEFAULTS: IconProps = { size: 14, weight: "bold" };

/** The playground: a tabbed sidebar driving one declaratively rendered map. */
function PlaygroundContent({ lang }: { lang: string }) {
  const t = getTranslations(lang);
  const language: Language = lang === "th" ? "th" : "en";
  const settings = useMapSettings(language);
  const drawing = useDrawing();
  const events = useEventLog();
  const route = useRoute();

  const [activeTab, setActiveTab] = useState<TabId>("map");
  const [pickMode, setPickMode] = useState<PickMode | null>(null);
  const [inspectPoint, setInspectPoint] = useState<Location | null>(null);
  const [dataPoint, setDataPoint] = useState<Location>(LOCATIONS.Bangkok);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(
    null
  );
  const [nearbyPlaces, setNearbyPlaces] = useState<PoiResult[]>([]);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [imported, setImported] = useState<GeoJsonLayer | null>(null);
  const [analysis, setAnalysis] = useState<GeoJsonLayer | null>(null);
  const [measureVersion, setMeasureVersion] = useState(0);
  const [outlineFailed, setOutlineFailed] = useState(false);

  const { addDestination } = route;
  const { setMode: setDrawingMode } = drawing;

  // Road names come from the routing service in the route's language, so a
  // calculated route is fetched again when the map language changes.
  const changeMapLanguage = (next: MapLanguage) => {
    settings.setLanguage(next);
    if (route.status === "complete") {
      route.setLanguage(next);
      route.search();
    }
  };

  const changeTab = (tab: TabId) => {
    setActiveTab(tab);
    setPickMode(null);
    if (tab !== "draw") {
      setDrawingMode("none");
    }
  };

  const addRouteStop = (location: Location) => {
    addDestination(location);
    setInspectPoint(null);
    changeTab("route");
  };

  const analyzeHere = (location: Location) => {
    setDataPoint(location);
    setInspectPoint(null);
    changeTab("data");
  };

  const handleMapClick = (location: Location) => {
    if (pickMode === "routeStop") {
      addDestination(location);
      return;
    }
    if (pickMode === "dataPoint") {
      setDataPoint(location);
      setPickMode(null);
      return;
    }
    if (drawing.handleClick(location)) {
      return;
    }
    setInspectPoint(location);
  };

  const toggleTag = (tag: string) =>
    setActiveTags((previous) =>
      previous.includes(tag)
        ? previous.filter((existing) => existing !== tag)
        : [...previous, tag]
    );

  return (
    <div className="relative flex h-dvh w-full overflow-hidden bg-fd-background font-sans text-[13px] text-fd-foreground max-md:flex-col">
      <Sidebar
        activeTab={activeTab}
        lang={lang}
        onTabChange={changeTab}
        panels={{
          data: (
            <DataTab
              language={settings.language}
              onPickModeChange={setPickMode}
              onPointChange={setDataPoint}
              pickMode={pickMode}
              point={dataPoint}
              t={t}
            />
          ),
          draw: (
            <DrawTab
              analysis={analysis}
              drawing={drawing}
              imported={imported}
              language={language}
              measureVersion={measureVersion}
              onAnalysisChange={setAnalysis}
              onImport={setImported}
              t={t}
            />
          ),
          events: <EventsTab events={events} t={t} />,
          map: (
            <MapTab
              settings={{ ...settings, setLanguage: changeMapLanguage }}
              t={t}
            />
          ),
          places: (
            <PlacesTab
              activeTags={activeTags}
              language={settings.language}
              nearbyPlaces={nearbyPlaces}
              onAddRouteStop={addRouteStop}
              onClearTags={() => setActiveTags([])}
              onNearbyChange={setNearbyPlaces}
              onSelectPlace={(place) => {
                setSelectedPlace(place);
                setOutlineFailed(false);
              }}
              onToggleTag={toggleTag}
              outlineFailed={outlineFailed}
              selectedPlace={selectedPlace}
              t={t}
            />
          ),
          route: (
            <RouteTab
              onPickModeChange={setPickMode}
              pickMode={pickMode}
              route={route}
              t={t}
            />
          ),
        }}
        t={t}
      />

      <MapView
        activeTags={activeTags}
        analysis={analysis}
        dataPoint={activeTab === "data" ? dataPoint : null}
        drawing={drawing}
        events={events}
        imported={imported}
        inspectPoint={inspectPoint}
        nearbyPlaces={nearbyPlaces}
        onAddRouteStop={addRouteStop}
        onAnalyzeHere={analyzeHere}
        onInspectClose={() => setInspectPoint(null)}
        onMapClick={handleMapClick}
        onOutlineResult={setOutlineFailed}
        onOverlayEdited={() => setMeasureVersion((version) => version + 1)}
        pickMode={pickMode}
        selectedPlace={selectedPlace}
        settings={settings}
        t={t}
      />
    </div>
  );
}

/** The full-page playground. Needs `NEXT_PUBLIC_SPHERE_API_KEY`. */
export function StandalonePlayground({ lang }: { lang: string }) {
  const t = getTranslations(lang);

  if (!API_KEY) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center bg-fd-background p-8 text-center text-fd-foreground">
        <p className="text-fd-muted-foreground text-sm">
          {t.header.apiKeyError}
        </p>
      </div>
    );
  }

  return (
    <IconContext.Provider value={ICON_DEFAULTS}>
      <SphereProvider apiKey={API_KEY}>
        <PlaygroundContent lang={lang} />
      </SphereProvider>
    </IconContext.Provider>
  );
}
