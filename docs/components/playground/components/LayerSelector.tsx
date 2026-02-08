"use client";

import {
  BASE_LAYERS,
  type BaseLayer,
  OVERLAY_LAYERS,
  type OverlayLayer,
  PREDEFINED_OVERLAYS,
  type PredefinedOverlay,
} from "../constants";
import "./LayerSelector.css";

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
      <div className="pg-panel-section">
        <div className="pg-section-header">Base Layer</div>
        <div className="pg-layer-grid">
          {BASE_LAYERS.map((layer) => (
            <button
              className={`pg-layer-btn ${currentLayer === layer.id ? "active" : ""}`}
              key={layer.id}
              onClick={() => onLayerChange(layer.id)}
              type="button"
            >
              <layer.icon className="pg-icon" size={14} />
              <span className="pg-label">{layer.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="pg-panel-section">
        <div className="pg-section-header">Data Layers</div>
        <div className="pg-layer-grid">
          {OVERLAY_LAYERS.map((layer) => (
            <button
              className={`pg-layer-btn ${activeOverlays.has(layer.id) ? "active" : ""}`}
              key={layer.id}
              onClick={() => onOverlayToggle(layer.id)}
              type="button"
            >
              <layer.icon className="pg-icon" size={14} />
              <span className="pg-label">{layer.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="pg-panel-section">
        <div className="pg-section-header">Live Overlays</div>
        <div className="pg-layer-grid">
          {PREDEFINED_OVERLAYS.map((overlay) => (
            <button
              className={`pg-layer-btn ${activePredefined.has(overlay.id) ? "active" : ""}`}
              key={overlay.id}
              onClick={() => onPredefinedToggle(overlay.id)}
              type="button"
            >
              <overlay.icon className="pg-icon" size={14} />
              <span className="pg-label">{overlay.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
