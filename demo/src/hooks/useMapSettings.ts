import type { Location } from "gistda-sphere-react";
import { useMap, useMapControls } from "gistda-sphere-react";
import { useEffect, useState } from "react";
import {
  type BaseLayer,
  DEFAULT_UI_CONTROLS,
  LOCATIONS,
  type OverlayLayer,
  type UiControlId,
} from "../constants";

export interface UseMapSettingsReturn {
  mapReady: boolean;
  currentLayer: BaseLayer;
  activeOverlays: Set<OverlayLayer>;
  uiControls: Record<UiControlId, boolean>;
  zoom: number;
  center: Location | null;
  setLayer: (layer: BaseLayer) => void;
  toggleOverlay: (layer: OverlayLayer) => void;
  toggleUiControl: (controlId: UiControlId) => void;
  navigateTo: (location: Location, zoom?: number) => void;
  setZoom: (zoom: number) => void;
  setCenter: (center: Location) => void;
}

export function useMapSettings(): UseMapSettingsReturn {
  const { map, isReady: mapReady } = useMap();
  const { setBaseLayer, addLayer, removeLayer, goTo } = useMapControls();

  const [currentLayer, setCurrentLayer] = useState<BaseLayer>("STREETS");
  const [activeOverlays, setActiveOverlays] = useState<Set<OverlayLayer>>(
    new Set()
  );
  const [uiControls, setUiControls] =
    useState<Record<UiControlId, boolean>>(DEFAULT_UI_CONTROLS);
  const [zoom, setZoom] = useState(10);
  const [center, setCenter] = useState<Location | null>(LOCATIONS.bangkok);

  useEffect(() => {
    if (!(mapReady && map)) {
      return;
    }
    for (const [controlId, visible] of Object.entries(uiControls)) {
      const control = map.Ui[controlId as UiControlId];
      if (control && "visible" in control) {
        control.visible(visible);
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

  const toggleUiControl = (controlId: UiControlId) => {
    if (!(mapReady && map)) {
      return;
    }
    const newState = !uiControls[controlId];
    setUiControls((prev) => ({ ...prev, [controlId]: newState }));
    const control = map.Ui[controlId];
    if (control && "visible" in control) {
      control.visible(newState);
    }
  };

  const navigateTo = (location: Location, zoomLevel = 12) => {
    goTo({ center: location, zoom: zoomLevel });
  };

  return {
    mapReady,
    currentLayer,
    activeOverlays,
    uiControls,
    zoom,
    center,
    setLayer,
    toggleOverlay,
    toggleUiControl,
    navigateTo,
    setZoom,
    setCenter,
  };
}
