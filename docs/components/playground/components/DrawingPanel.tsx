"use client";

import { Trash2 } from "lucide-react";
import { DRAWING_HINTS, DRAWING_TOOLS, type DrawingMode } from "../constants";
import "./DrawingPanel.css";

interface DrawingPanelProps {
  mode: DrawingMode;
  onModeChange: (mode: DrawingMode) => void;
  onClear: () => void;
}

/** Panel for selecting drawing tools and clearing all shapes. */
export function DrawingPanel({
  mode,
  onModeChange,
  onClear,
}: DrawingPanelProps) {
  return (
    <div className="pg-panel-section">
      <div className="pg-section-header">Drawing Tools</div>
      <div className="pg-tool-grid">
        {DRAWING_TOOLS.map((tool) => (
          <button
            className={`pg-tool-btn ${mode === tool.id ? "active" : ""}`}
            key={tool.id}
            onClick={() => onModeChange(tool.id)}
            title={tool.label}
            type="button"
          >
            <tool.icon size={18} />
          </button>
        ))}
        <button
          className="pg-tool-btn danger"
          onClick={onClear}
          title="Clear All"
          type="button"
        >
          <Trash2 size={18} />
        </button>
      </div>
      <p className="pg-tool-hint">{DRAWING_HINTS[mode]}</p>
    </div>
  );
}
