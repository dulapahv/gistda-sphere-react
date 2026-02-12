"use client";

import { UI_CONTROLS, type UiControlId } from "../constants";
import { getTranslations, type PlaygroundTranslations } from "../translations";

function controlLabel(t: PlaygroundTranslations, id: string): string {
  const map: Record<string, string> = {
    DPad: t.controlDPad,
    Geolocation: t.controlGeolocation,
    Zoombar: t.controlZoomBar,
    Toolbar: t.controlToolbar,
    Fullscreen: t.controlFullscreen,
    Crosshair: t.controlCrosshair,
    Scale: t.controlScale,
  };
  return map[id] ?? id;
}

interface MapControlsPanelProps {
  uiControls: Record<UiControlId, boolean>;
  mapReady: boolean;
  onToggle: (controlId: UiControlId) => void;
  lang: string;
}

export function MapControlsPanel({
  uiControls,
  mapReady,
  onToggle,
  lang,
}: MapControlsPanelProps) {
  const t = getTranslations(lang);

  return (
    <div className="mb-4">
      <div className="mb-2.5 font-semibold text-[11px] text-fd-muted-foreground uppercase tracking-wider">
        {t.mapControls}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {UI_CONTROLS.map((control) => {
          const label = controlLabel(t, control.id);
          return (
            <button
              className={`flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1.5 text-[11px] disabled:cursor-not-allowed disabled:opacity-40 ${
                uiControls[control.id]
                  ? "border-fd-primary bg-fd-primary text-fd-primary-foreground"
                  : "border-fd-border bg-fd-secondary text-fd-secondary-foreground hover:border-fd-ring hover:bg-fd-accent hover:text-fd-foreground"
              }`}
              disabled={!mapReady}
              key={control.id}
              onClick={() => onToggle(control.id)}
              title={label}
              type="button"
            >
              <control.icon size={14} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
