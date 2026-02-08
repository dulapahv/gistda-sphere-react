import type { Location } from "gistda-sphere-react";
import { useMap, useMapControls } from "gistda-sphere-react";
import { useEffect, useState } from "react";
import {
  type BaseLayer,
  DEFAULT_UI_CONTROLS,
  LOCATIONS,
  type OverlayLayer,
  type PredefinedOverlay,
  type UiControlId,
} from "../constants";

export interface UseMapSettingsReturn {
  mapReady: boolean;
  currentLayer: BaseLayer;
  activeOverlays: Set<OverlayLayer>;
  activePredefined: Set<PredefinedOverlay>;
  uiControls: Record<UiControlId, boolean>;
  zoom: number;
  center: Location | null;
  setLayer: (layer: BaseLayer) => void;
  toggleOverlay: (layer: OverlayLayer) => void;
  togglePredefined: (overlay: PredefinedOverlay) => void;
  toggleUiControl: (controlId: UiControlId) => void;
  navigateTo: (location: Location, zoom?: number) => void;
  setZoom: (zoom: number) => void;
  setCenter: (center: Location) => void;
}

/** Manages map settings including layers, overlays, UI controls, and navigation. */
export function useMapSettings(): UseMapSettingsReturn {
  const { map, isReady: mapReady } = useMap();
  const {
    setBaseLayer,
    addLayer,
    removeLayer,
    loadPredefinedOverlay,
    unloadPredefinedOverlay,
    goTo,
  } = useMapControls();

  const [currentLayer, setCurrentLayer] = useState<BaseLayer>("STREETS");
  const [activeOverlays, setActiveOverlays] = useState<Set<OverlayLayer>>(
    new Set()
  );
  const [activePredefined, setActivePredefined] = useState<
    Set<PredefinedOverlay>
  >(new Set());
  const [uiControls, setUiControls] =
    useState<Record<UiControlId, boolean>>(DEFAULT_UI_CONTROLS);
  const [zoom, setZoom] = useState(10);
  const [center, setCenter] = useState<Location | null>(LOCATIONS.Bangkok);

  useEffect(() => {
    if (!(mapReady && map)) {
      return;
    }
    for (const [controlId, visible] of Object.entries(uiControls)) {
      const control = map.Ui[controlId as UiControlId];
      if (control && "visible" in control) {
        (control as { visible: (v: boolean) => void }).visible(visible);
      }
    }
  }, [mapReady, map, uiControls]);

  const setLayer = (layer: BaseLayer) => {
    setCurrentLayer(layer);
    setBaseLayer(layer);
  };

  const toggleOverlay = (layer: OverlayLayer) => {
    setActiveOverlays((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) {
        next.delete(layer);
        removeLayer(layer);
      } else {
        next.add(layer);
        addLayer(layer);
      }
      return next;
    });
  };

  const togglePredefined = (overlay: PredefinedOverlay) => {
    setActivePredefined((prev) => {
      const next = new Set(prev);
      if (next.has(overlay)) {
        next.delete(overlay);
        unloadPredefinedOverlay(overlay);
      } else {
        next.add(overlay);
        loadPredefinedOverlay(overlay);
      }
      return next;
    });
  };

  const toggleUiControl = (controlId: UiControlId) => {
    if (!(mapReady && map)) {
      return;
    }
    const newState = !uiControls[controlId];
    setUiControls((prev) => ({ ...prev, [controlId]: newState }));
    const control = map.Ui[controlId];
    if (control && "visible" in control) {
      (control as { visible: (v: boolean) => void }).visible(newState);
    }
  };

  const navigateTo = (location: Location, zoomLevel = 12) => {
    goTo({ center: location, zoom: zoomLevel });
  };

  return {
    mapReady,
    currentLayer,
    activeOverlays,
    activePredefined,
    uiControls,
    zoom,
    center,
    setLayer,
    toggleOverlay,
    togglePredefined,
    toggleUiControl,
    navigateTo,
    setZoom,
    setCenter,
  };
}
