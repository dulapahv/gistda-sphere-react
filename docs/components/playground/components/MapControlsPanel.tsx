"use client";

import { UI_CONTROLS, type UiControlId } from "../constants";

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
    <div className="mb-4">
      <div className="mb-2.5 font-semibold text-[11px] text-fd-muted-foreground uppercase tracking-wider">
        Map Controls
      </div>
      <div className="flex flex-wrap gap-1.5">
        {UI_CONTROLS.map((control) => (
          <button
            className={`flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1.5 text-[11px] disabled:cursor-not-allowed disabled:opacity-40 ${
              uiControls[control.id]
                ? "border-fd-primary bg-fd-primary text-fd-primary-foreground"
                : "border-fd-border bg-fd-secondary text-fd-secondary-foreground hover:border-fd-ring hover:bg-fd-accent hover:text-fd-foreground"
            }`}
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
