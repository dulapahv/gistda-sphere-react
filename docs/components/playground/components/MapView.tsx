"use client";

import { CrosshairIcon } from "@phosphor-icons/react";
import {
  GeoJson,
  type GeometryOptions,
  Layer,
  type Location,
  Marker,
  ObjectOverlay,
  type PoiResult,
  Popup,
  PredefinedOverlay,
  SphereMap,
  type SphereMapEventProps,
  Tag,
} from "gistda-sphere-react";
import { useMemo } from "react";
import { LOCATIONS } from "../constants";
import type {
  EventLogStore,
  UseDrawingReturn,
  UseMapSettingsReturn,
} from "../hooks";
import type { PlaygroundTranslations } from "../translations";
import type { GeoJsonLayer, PickMode, SelectedPlace } from "../types";
import { AdvancedLayers } from "./AdvancedLayers";
import { DrawnShapes } from "./DrawnShapes";
import { InteractionSync } from "./InteractionSync";
import { InspectCard, NumberBadge, PlaceCard } from "./MapCards";
import { PlaygroundControls } from "./PlaygroundControls";

/** Every `SphereMap` event prop, with the Sphere event name it logs as. */
const LOGGED_EVENTS = [
  ["onBeforeContextMenu", "beforeContextmenu"],
  ["onContextMenu", "contextmenu"],
  ["onDrag", "drag"],
  ["onDrawCreate", "drawCreate"],
  ["onDrawDelete", "drawDelete"],
  ["onDrop", "drop"],
  ["onError", "error"],
  ["onFullscreen", "fullscreen"],
  ["onIdle", "idle"],
  ["onLayerChange", "layerChange"],
  ["onLocation", "location"],
  ["onMouseMove", "mousemove"],
  ["onOverlayChange", "overlayChange"],
  ["onOverlayClick", "overlayClick"],
  ["onOverlayDrag", "overlayDrag"],
  ["onOverlayDrop", "overlayDrop"],
  ["onOverlayHover", "overlayHover"],
  ["onOverlayLeave", "overlayLeave"],
  ["onOverlayLoad", "overlayLoad"],
  ["onOverlayUpdate", "overlayUpdate"],
  ["onPitch", "pitch"],
  ["onPopupClose", "popupClose"],
  ["onRepaint", "repaint"],
  ["onResize", "resize"],
  ["onRotate", "rotate"],
  ["onRouteComplete", "routeComplete"],
  ["onRouteError", "routeError"],
  ["onTileLoaded", "tileLoaded"],
  ["onTileLoading", "tileLoading"],
  ["onToolbarChange", "toolbarChange"],
  ["onTooltipChange", "tooltipChange"],
  ["onWheel", "wheel"],
  ["onZoom", "zoom"],
  ["onZoomRange", "zoomRange"],
] as const satisfies ReadonlyArray<
  readonly [keyof SphereMapEventProps, string]
>;

/** CrosshairIcon cursor over the map while clicks pick points or draw. */
const PICKING_CURSOR =
  "[&_.maplibregl-canvas-container]:cursor-crosshair! [&_.maplibregl-canvas]:cursor-crosshair!";

const IMPORT_STYLE: GeometryOptions = {
  fillColor: "rgba(16, 185, 129, 0.25)",
  lineColor: "rgb(5, 150, 105)",
  lineWidth: 3,
};

const RESULT_STYLE: GeometryOptions = {
  fillColor: "rgba(239, 68, 68, 0.3)",
  lineColor: "rgb(220, 38, 38)",
  lineStyle: "Dashed",
  lineWidth: 3,
};

const OUTLINE_STYLE: GeometryOptions = {
  fillColor: "rgba(59, 130, 246, 0.12)",
  lineColor: "rgb(37, 99, 235)",
  lineWidth: 2,
};

export interface MapViewProps {
  activeTags: string[];
  analysis: GeoJsonLayer | null;
  dataPoint: Location | null;
  drawing: UseDrawingReturn;
  events: EventLogStore;
  imported: GeoJsonLayer | null;
  inspectPoint: Location | null;
  nearbyPlaces: PoiResult[];
  onAddRouteStop: (location: Location) => void;
  onAnalyzeHere: (location: Location) => void;
  onInspectClose: () => void;
  onMapClick: (location: Location) => void;
  /** Whether the selected place's outline failed to load. */
  onOutlineResult: (failed: boolean) => void;
  /** Called when the user drags or edits an overlay. */
  onOverlayEdited: () => void;
  pickMode: PickMode | null;
  selectedPlace: SelectedPlace | null;
  settings: UseMapSettingsReturn;
  t: PlaygroundTranslations;
}

/** The playground map: renders all state declaratively. */
export function MapView({
  activeTags,
  analysis,
  dataPoint,
  drawing,
  events,
  imported,
  inspectPoint,
  nearbyPlaces,
  onAddRouteStop,
  onAnalyzeHere,
  onInspectClose,
  onMapClick,
  onOverlayEdited,
  onOutlineResult,
  pickMode,
  selectedPlace,
  settings,
  t,
}: MapViewProps) {
  const loggers = useMemo(() => {
    const props: Record<string, (...args: unknown[]) => void> = {};
    for (const [prop, eventName] of LOGGED_EVENTS) {
      props[prop] = (...args) => events.log(eventName, args);
    }
    return props as SphereMapEventProps;
  }, [events]);

  const selectedPoi = selectedPlace?.poi;
  const isPicking = pickMode !== null || drawing.mode !== "none";

  return (
    <div
      className={`relative min-w-0 flex-1 max-md:h-[55vh] ${isPicking ? PICKING_CURSOR : ""}`}
    >
      <SphereMap
        {...loggers}
        baseLayer={settings.baseLayer}
        center={LOCATIONS.Bangkok}
        controls={settings.controls}
        filter={settings.filter}
        language={settings.language}
        onClick={(location) => {
          events.log("click", [location]);
          onMapClick({ lat: location.lat, lon: location.lon });
        }}
        onDoubleClick={(location) => {
          events.log("doubleClick", [location]);
          drawing.finish();
        }}
        onOverlayClick={(overlay, location) => {
          events.log("overlayClick", [overlay, location]);
          // Clicks on shapes reach Sphere as overlay clicks, not map clicks.
          // While drawing or picking, treat them as clicks on the map.
          if (isPicking) {
            onMapClick({ lat: location.lat, lon: location.lon });
          }
        }}
        onOverlayDrop={(overlay) => {
          events.log("overlayDrop", [overlay]);
          onOverlayEdited();
        }}
        onOverlayUpdate={(overlay) => {
          events.log("overlayUpdate", [overlay]);
          onOverlayEdited();
        }}
        onReady={() => events.log("ready", [])}
        style={{ height: "100%", width: "100%" }}
        zoom={10}
        zoomRange={settings.zoomRange}
      >
        <InteractionSync
          drawingMode={drawing.mode}
          interaction={settings.interaction}
        />
        {settings.showCustomControls ? (
          <PlaygroundControls
            baseLayer={settings.baseLayer}
            onBaseLayerChange={settings.setBaseLayer}
            t={t}
          />
        ) : null}

        {settings.dataLayers.map((layer) => (
          <Layer key={layer} preset={layer} />
        ))}
        {settings.liveOverlays.map((type) => (
          <PredefinedOverlay key={type} type={type} />
        ))}
        <AdvancedLayers layers={settings.advancedLayers} />
        {activeTags.map((tag) => (
          <Tag key={tag} name={tag} />
        ))}

        <DrawnShapes drawing={drawing} t={t} />
        {imported ? (
          <GeoJson
            data={imported.data}
            fitBounds={{ maxZoom: 16, padding: 60 }}
            style={IMPORT_STYLE}
          />
        ) : null}
        {analysis ? (
          <GeoJson data={analysis.data} pointType="dot" style={RESULT_STYLE} />
        ) : null}

        {selectedPoi ? (
          <Marker
            popupContent={<PlaceCard poi={selectedPoi} t={t} />}
            position={{ lat: selectedPoi.lat, lon: selectedPoi.lon }}
            title={selectedPoi.name}
          />
        ) : null}
        {selectedPoi && selectedPlace?.showOutline ? (
          <ObjectOverlay
            {...OUTLINE_STYLE}
            fitBounds={{ padding: 60 }}
            id={selectedPoi.id}
            key={selectedPoi.id}
            onError={() => onOutlineResult(true)}
            onLoad={() => onOutlineResult(false)}
            timeout={10_000}
          />
        ) : null}
        {nearbyPlaces.map((poi, index) => (
          <Marker
            key={poi.id}
            popupContent={<PlaceCard poi={poi} t={t} />}
            position={{ lat: poi.lat, lon: poi.lon }}
            title={poi.name}
          >
            <NumberBadge value={index + 1} />
          </Marker>
        ))}

        {dataPoint ? (
          <Marker position={dataPoint} title={t.data.point}>
            <span className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-violet-600 text-white shadow-md">
              <CrosshairIcon size={15} />
            </span>
          </Marker>
        ) : null}

        {inspectPoint ? (
          <Popup
            onClose={onInspectClose}
            position={inspectPoint}
            title={t.inspect.title}
          >
            <InspectCard
              onAddRouteStop={onAddRouteStop}
              onAnalyzeHere={onAnalyzeHere}
              point={inspectPoint}
              t={t}
            />
          </Popup>
        ) : null}
      </SphereMap>
    </div>
  );
}
