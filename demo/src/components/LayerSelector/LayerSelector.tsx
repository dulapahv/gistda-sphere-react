import {
  BASE_LAYERS,
  type BaseLayer,
  OVERLAY_LAYERS,
  type OverlayLayer,
  PREDEFINED_OVERLAYS,
  type PredefinedOverlay,
} from "../../constants";
import "./LayerSelector.css";

interface LayerSelectorProps {
  currentLayer: BaseLayer;
  activeOverlays: Set<OverlayLayer>;
  activePredefined: Set<PredefinedOverlay>;
  onLayerChange: (layer: BaseLayer) => void;
  onOverlayToggle: (layer: OverlayLayer) => void;
  onPredefinedToggle: (overlay: PredefinedOverlay) => void;
}

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
      <div className="panel-section">
        <div className="section-header">Base Layer</div>
        <div className="layer-grid">
          {BASE_LAYERS.map((layer) => (
            <button
              className={`layer-btn ${currentLayer === layer.id ? "active" : ""}`}
              key={layer.id}
              onClick={() => onLayerChange(layer.id)}
              type="button"
            >
              <layer.icon className="icon" size={14} />
              <span className="label">{layer.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="panel-section">
        <div className="section-header">Data Layers</div>
        <div className="layer-grid">
          {OVERLAY_LAYERS.map((layer) => (
            <button
              className={`layer-btn ${activeOverlays.has(layer.id) ? "active" : ""}`}
              key={layer.id}
              onClick={() => onOverlayToggle(layer.id)}
              type="button"
            >
              <layer.icon className="icon" size={14} />
              <span className="label">{layer.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="panel-section">
        <div className="section-header">Live Overlays</div>
        <div className="layer-grid">
          {PREDEFINED_OVERLAYS.map((overlay) => (
            <button
              className={`layer-btn ${activePredefined.has(overlay.id) ? "active" : ""}`}
              key={overlay.id}
              onClick={() => onPredefinedToggle(overlay.id)}
              type="button"
            >
              <overlay.icon className="icon" size={14} />
              <span className="label">{overlay.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
