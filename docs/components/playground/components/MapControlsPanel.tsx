"use client";

import { UI_CONTROLS, type UiControlId } from "../constants";
import "./MapControlsPanel.css";

interface MapControlsPanelProps {
  uiControls: Record<UiControlId, boolean>;
  mapReady: boolean;
  onToggle: (controlId: UiControlId) => void;
}

/** Panel for toggling map UI controls visibility. */
export function MapControlsPanel({
  uiControls,
  mapReady,
  onToggle,
}: MapControlsPanelProps) {
  return (
    <div className="pg-panel-section">
      <div className="pg-section-header">Map Controls</div>
      <div className="pg-control-grid">
        {UI_CONTROLS.map((control) => (
          <button
            className={`pg-control-btn ${uiControls[control.id] ? "active" : ""}`}
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
