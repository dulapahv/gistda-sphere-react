import { BASE_LAYERS, type BaseLayer } from "../../constants";
import "./LayerSelector.css";

interface LayerSelectorProps {
  currentLayer: BaseLayer;
  onLayerChange: (layer: BaseLayer) => void;
}

export function LayerSelector({
  currentLayer,
  onLayerChange,
}: LayerSelectorProps) {
  return (
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
  );
}
