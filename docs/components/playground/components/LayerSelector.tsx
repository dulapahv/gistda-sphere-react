"use client";

import {
  BASE_LAYERS,
  type BaseLayer,
  OVERLAY_LAYERS,
  type OverlayLayer,
  PREDEFINED_OVERLAYS,
  type PredefinedOverlay,
} from "../constants";

interface LayerSelectorProps {
  currentLayer: BaseLayer;
  activeOverlays: Set<OverlayLayer>;
  activePredefined: Set<PredefinedOverlay>;
  onLayerChange: (layer: BaseLayer) => void;
  onOverlayToggle: (layer: OverlayLayer) => void;
  onPredefinedToggle: (overlay: PredefinedOverlay) => void;
}

/** Panel for selecting base layers, data layers, and predefined overlays. */
export function LayerSelector({
  currentLayer,
  activeOverlays,
  activePredefined,
  onLayerChange,
  onOverlayToggle,
  onPredefinedToggle,
}: LayerSelectorProps) {
  return (
    <>
      <div className="mb-4">
        <div className="mb-2.5 font-semibold text-[11px] text-fd-muted-foreground uppercase tracking-wider">
          Base Layer
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
              <span className="font-medium">{layer.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <div className="mb-2.5 font-semibold text-[11px] text-fd-muted-foreground uppercase tracking-wider">
          Data Layers
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
              <span className="font-medium">{layer.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <div className="mb-2.5 font-semibold text-[11px] text-fd-muted-foreground uppercase tracking-wider">
          Live Overlays
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
              <span className="font-medium">{overlay.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
