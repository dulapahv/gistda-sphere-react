import type { FilterType, PredefinedOverlay, Range } from "gistda-sphere-react";
import { useState } from "react";
import {
  type AdvancedLayer,
  type BaseLayer,
  type ControlId,
  type DataLayer,
  DEFAULT_UI_CONTROLS,
  type MapLanguage,
} from "../constants";

/** How users may interact with the map. */
export interface InteractionSettings {
  /** Show the address entry in the right-click menu. */
  contextMenuAddress: boolean;
  /** Show the nearby places entry in the right-click menu. */
  contextMenuNearPoi: boolean;
  keyboard: boolean;
  /** Cover the map with a lock until the user clicks to unlock it. */
  locked: boolean;
  mouseDrag: boolean;
  mouseWheel: boolean;
}

const DEFAULT_INTERACTION: InteractionSettings = {
  contextMenuAddress: true,
  contextMenuNearPoi: true,
  keyboard: true,
  locked: false,
  mouseDrag: true,
  mouseWheel: true,
};

export const DEFAULT_ZOOM_RANGE: Range = { max: 22, min: 0 };

/** Adds the item when missing, removes it when present. */
function toggleItem<T>(items: readonly T[], item: T): T[] {
  return items.includes(item)
    ? items.filter((existing) => existing !== item)
    : [...items, item];
}

export interface UseMapSettingsReturn {
  advancedLayers: AdvancedLayer[];
  baseLayer: BaseLayer;
  controls: Record<ControlId, boolean>;
  dataLayers: DataLayer[];
  filter: FilterType;
  interaction: InteractionSettings;
  language: MapLanguage;
  liveOverlays: PredefinedOverlay[];
  setBaseLayer: (layer: BaseLayer) => void;
  setFilter: (filter: FilterType) => void;
  setInteraction: (changes: Partial<InteractionSettings>) => void;
  setLanguage: (language: MapLanguage) => void;
  setShowCustomControls: (show: boolean) => void;
  setZoomRange: (range: Range) => void;
  showCustomControls: boolean;
  toggleAdvancedLayer: (layer: AdvancedLayer) => void;
  toggleControl: (control: ControlId) => void;
  toggleDataLayer: (layer: DataLayer) => void;
  toggleLiveOverlay: (overlay: PredefinedOverlay) => void;
  zoomRange: Range;
}

/**
 * Map settings as plain state. `MapView` renders them declaratively
 * (`SphereMap` props, `<Layer>`, `<PredefinedOverlay>`…), so this hook has
 * no side effects of its own.
 */
export function useMapSettings(
  initialLanguage: MapLanguage
): UseMapSettingsReturn {
  const [baseLayer, setBaseLayer] = useState<BaseLayer>("STREETS");
  const [filter, setFilter] = useState<FilterType>("None");
  const [language, setLanguage] = useState<MapLanguage>(initialLanguage);
  const [controls, setControls] =
    useState<Record<ControlId, boolean>>(DEFAULT_UI_CONTROLS);
  const [dataLayers, setDataLayers] = useState<DataLayer[]>([]);
  const [liveOverlays, setLiveOverlays] = useState<PredefinedOverlay[]>([]);
  const [advancedLayers, setAdvancedLayers] = useState<AdvancedLayer[]>([]);
  const [interaction, setInteractionState] =
    useState<InteractionSettings>(DEFAULT_INTERACTION);
  const [zoomRange, setZoomRange] = useState<Range>(DEFAULT_ZOOM_RANGE);
  const [showCustomControls, setShowCustomControls] = useState(true);

  return {
    advancedLayers,
    baseLayer,
    controls,
    dataLayers,
    filter,
    interaction,
    language,
    liveOverlays,
    setBaseLayer,
    setFilter,
    setInteraction: (changes) =>
      setInteractionState((previous) => ({ ...previous, ...changes })),
    setLanguage,
    setShowCustomControls,
    setZoomRange,
    showCustomControls,
    toggleAdvancedLayer: (layer) =>
      setAdvancedLayers((previous) => toggleItem(previous, layer)),
    toggleControl: (control) =>
      setControls((previous) => ({
        ...previous,
        [control]: !previous[control],
      })),
    toggleDataLayer: (layer) =>
      setDataLayers((previous) => toggleItem(previous, layer)),
    toggleLiveOverlay: (overlay) =>
      setLiveOverlays((previous) => toggleItem(previous, overlay)),
    zoomRange,
  };
}
