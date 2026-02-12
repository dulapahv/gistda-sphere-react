"use client";

import {
  BASE_LAYERS,
  type BaseLayer,
  OVERLAY_LAYERS,
  type OverlayLayer,
  PREDEFINED_OVERLAYS,
  type PredefinedOverlay,
} from "../constants";
import { getTranslations, type PlaygroundTranslations } from "../translations";

function baseLayerLabel(t: PlaygroundTranslations, id: BaseLayer): string {
  const map: Record<BaseLayer, string> = {
    SIMPLE: t.layerSimple,
    STREETS: t.layerStreets,
    STREETS_NIGHT: t.layerNight,
    HYBRID: t.layerHybrid,
  };
  return map[id];
}

function overlayLabel(t: PlaygroundTranslations, id: OverlayLayer): string {
  const map: Record<OverlayLayer, string> = {
    TRAFFIC: t.overlayTraffic,
    IMAGES: t.overlayImages,
    PM25: t.overlayPM25,
    HOTSPOT: t.overlayHotspot,
    FLOOD: t.overlayFlood,
    DROUGHT: t.overlayDrought,
  };
  return map[id];
}

function predefinedLabel(
  t: PlaygroundTranslations,
  id: PredefinedOverlay
): string {
  const map: Record<PredefinedOverlay, string> = {
    cameras: t.predefinedCCTV,
    events: t.predefinedEvents,
    aqi: t.predefinedAQI,
  };
  return map[id];
}

interface LayerSelectorProps {
  currentLayer: BaseLayer;
  activeOverlays: Set<OverlayLayer>;
  activePredefined: Set<PredefinedOverlay>;
  onLayerChange: (layer: BaseLayer) => void;
  onOverlayToggle: (layer: OverlayLayer) => void;
  onPredefinedToggle: (overlay: PredefinedOverlay) => void;
  lang: string;
}

export function LayerSelector({
  currentLayer,
  activeOverlays,
  activePredefined,
  onLayerChange,
  onOverlayToggle,
  onPredefinedToggle,
  lang,
}: LayerSelectorProps) {
  const t = getTranslations(lang);

  return (
    <>
      <div className="mb-4">
        <div className="mb-2.5 font-semibold text-[11px] text-fd-muted-foreground uppercase tracking-wider">
          {t.baseLayer}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {BASE_LAYERS.map((layer) => (
            <button
              className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs ${
                currentLayer === layer.id
                  ? "border-fd-primary bg-fd-primary text-fd-primary-foreground"
                  : "border-fd-border bg-fd-secondary text-fd-secondary-foreground hover:border-fd-ring hover:bg-fd-accent hover:text-fd-foreground"
              }`}
              key={layer.id}
              onClick={() => onLayerChange(layer.id)}
              type="button"
            >
              <layer.icon className="h-3.5 w-3.5" size={14} />
              <span className="font-medium">{baseLayerLabel(t, layer.id)}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <div className="mb-2.5 font-semibold text-[11px] text-fd-muted-foreground uppercase tracking-wider">
          {t.dataLayers}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {OVERLAY_LAYERS.map((layer) => (
            <button
              className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs ${
                activeOverlays.has(layer.id)
                  ? "border-fd-primary bg-fd-primary text-fd-primary-foreground"
                  : "border-fd-border bg-fd-secondary text-fd-secondary-foreground hover:border-fd-ring hover:bg-fd-accent hover:text-fd-foreground"
              }`}
              key={layer.id}
              onClick={() => onOverlayToggle(layer.id)}
              type="button"
            >
              <layer.icon className="h-3.5 w-3.5" size={14} />
              <span className="font-medium">{overlayLabel(t, layer.id)}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <div className="mb-2.5 font-semibold text-[11px] text-fd-muted-foreground uppercase tracking-wider">
          {t.liveOverlays}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PREDEFINED_OVERLAYS.map((overlay) => (
            <button
              className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs ${
                activePredefined.has(overlay.id)
                  ? "border-fd-primary bg-fd-primary text-fd-primary-foreground"
                  : "border-fd-border bg-fd-secondary text-fd-secondary-foreground hover:border-fd-ring hover:bg-fd-accent hover:text-fd-foreground"
              }`}
              key={overlay.id}
              onClick={() => onPredefinedToggle(overlay.id)}
              type="button"
            >
              <overlay.icon className="h-3.5 w-3.5" size={14} />
              <span className="font-medium">
                {predefinedLabel(t, overlay.id)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
