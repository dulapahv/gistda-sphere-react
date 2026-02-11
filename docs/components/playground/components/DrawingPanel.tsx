"use client";

import { Trash2 } from "lucide-react";
import { DRAWING_TOOLS, type DrawingMode } from "../constants";
import {
  getDrawingHint,
  getTranslations,
  type PlaygroundTranslations,
} from "../translations";

/** Returns the localized label for a drawing tool. */
function toolLabel(t: PlaygroundTranslations, id: DrawingMode): string {
  const map: Record<DrawingMode, string> = {
    none: t.toolPan,
    marker: t.toolMarker,
    dot: t.toolDot,
    polygon: t.toolPolygon,
    polyline: t.toolLine,
    circle: t.toolCircle,
    rectangle: t.toolRect,
  };
  return map[id];
}

interface DrawingPanelProps {
  mode: DrawingMode;
  onModeChange: (mode: DrawingMode) => void;
  onClear: () => void;
  lang: string;
}

/** Panel for selecting drawing tools and clearing all shapes. */
export function DrawingPanel({
  mode,
  onModeChange,
  onClear,
  lang,
}: DrawingPanelProps) {
  const t = getTranslations(lang);

  return (
    <div className="mb-4">
      <div className="mb-2.5 font-semibold text-[11px] text-fd-muted-foreground uppercase tracking-wider">
        {t.drawingTools}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {DRAWING_TOOLS.map((tool) => (
          <button
            className={`flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-md border ${
              mode === tool.id
                ? "border-fd-primary bg-fd-primary text-fd-primary-foreground"
                : "border-fd-border bg-fd-secondary text-fd-secondary-foreground hover:border-fd-ring hover:bg-fd-accent hover:text-fd-foreground"
            }`}
            key={tool.id}
            onClick={() => onModeChange(tool.id)}
            title={toolLabel(t, tool.id)}
            type="button"
          >
            <tool.icon size={18} />
          </button>
        ))}
        <button
          className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-md border border-fd-border bg-fd-secondary text-fd-error hover:border-fd-error hover:bg-fd-error/10"
          onClick={onClear}
          title={t.clearAll}
          type="button"
        >
          <Trash2 size={18} />
        </button>
      </div>
      <p className="mt-2 text-fd-secondary-foreground text-xs leading-relaxed">
        {getDrawingHint(t, mode)}
      </p>
    </div>
  );
}
