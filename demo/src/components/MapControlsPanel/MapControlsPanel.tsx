import { UI_CONTROLS, type UiControlId } from "../../constants";
import "./MapControlsPanel.css";

interface MapControlsPanelProps {
  uiControls: Record<UiControlId, boolean>;
  mapReady: boolean;
  onToggle: (controlId: UiControlId) => void;
}

export function MapControlsPanel({
  uiControls,
  mapReady,
  onToggle,
}: MapControlsPanelProps) {
  return (
    <div className="panel-section">
      <div className="section-header">Map Controls</div>
      <div className="control-grid">
        {UI_CONTROLS.map((control) => (
          <button
            className={`control-btn ${uiControls[control.id] ? "active" : ""}`}
            disabled={!mapReady}
            key={control.id}
            onClick={() => onToggle(control.id)}
            title={control.label}
            type="button"
          >
            <control.icon size={14} />
            <span>{control.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
