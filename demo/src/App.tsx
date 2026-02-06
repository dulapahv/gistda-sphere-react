import { type Location, SphereProvider } from "gistda-sphere-react";
import { useCallback, useState } from "react";
import "./App.css";
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
import type { SearchMarkerData } from "./types";

function MapContent() {
  const mapSettings = useMapSettings();
  const drawing = useDrawing();
  const { handleClick: drawingClick } = drawing;
  const { navigateTo } = mapSettings;

  const [searchMarker, setSearchMarker] = useState<SearchMarkerData | null>(
    null,
  );
  const [routeOrigin, setRouteOrigin] = useState<Location | null>(null);
  const [routeDestination, setRouteDestination] = useState<Location | null>(
    null,
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
    [settingRoutePoint, drawingClick],
  );

  const handleSearchResult = useCallback(
    (marker: SearchMarkerData) => {
      setSearchMarker(marker);
      navigateTo(marker.position, 16);
    },
    [navigateTo],
  );

  return (
    <div className="app-container">
      <Sidebar>
        <MapStats
          center={mapSettings.center}
          totalShapes={drawing.totalShapes}
          zoom={mapSettings.zoom}
        />

        <LayerSelector
          currentLayer={mapSettings.currentLayer}
          onLayerChange={mapSettings.setLayer}
        />

        <MapControlsPanel
          mapReady={mapSettings.mapReady}
          onToggle={mapSettings.toggleUiControl}
          uiControls={mapSettings.uiControls}
        />

        <QuickNav onNavigate={mapSettings.navigateTo} />

        <div className="section-divider" />

        <DrawingPanel
          mode={drawing.mode}
          onClear={drawing.clearAll}
          onModeChange={drawing.setMode}
        />

        <div className="section-divider" />

        <SearchPanel onResultSelect={handleSearchResult} />

        <div className="section-divider" />

        <RoutePanel
          destination={routeDestination}
          onSetDestination={setRouteDestination}
          onSetOrigin={setRouteOrigin}
          onSettingPointChange={setSettingRoutePoint}
          origin={routeOrigin}
          settingPoint={settingRoutePoint}
        />

        <div className="section-divider" />

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

function App() {
  const apiKey = import.meta.env.VITE_SPHERE_API_KEY;

  if (!apiKey) {
    return (
      <div className="error-screen">
        <h1>Missing API Key</h1>
        <p>
          Create a <code>.env</code> file with <code>VITE_SPHERE_API_KEY</code>
        </p>
      </div>
    );
  }

  return (
    <SphereProvider apiKey={apiKey}>
      <MapContent />
    </SphereProvider>
  );
}

export default App;
