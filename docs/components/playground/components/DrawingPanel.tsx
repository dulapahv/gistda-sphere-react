"use client";

import { Trash2 } from "lucide-react";
import { DRAWING_HINTS, DRAWING_TOOLS, type DrawingMode } from "../constants";

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
    <div className="mb-4">
      <div className="mb-2.5 font-semibold text-[11px] text-fd-muted-foreground uppercase tracking-wider">
        Drawing Tools
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
            title={tool.label}
            type="button"
          >
            <tool.icon size={18} />
          </button>
        ))}
        <button
          className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-md border border-fd-border bg-fd-secondary text-fd-error hover:border-fd-error hover:bg-fd-error/10"
          onClick={onClear}
          title="Clear All"
          type="button"
        >
          <Trash2 size={18} />
        </button>
      </div>
      <p className="mt-2 text-fd-secondary-foreground text-xs leading-relaxed">
        {DRAWING_HINTS[mode]}
      </p>
    </div>
  );
}
