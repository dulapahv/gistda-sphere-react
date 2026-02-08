"use client";

import type { Location } from "gistda-sphere-react";
import { LOCATIONS } from "../constants";

interface QuickNavProps {
  onNavigate: (location: Location, zoom?: number) => void;
}

/** Quick navigation buttons for common Thai cities. */
export function QuickNav({ onNavigate }: QuickNavProps) {
  return (
    <div className="mb-4">
      <div className="mb-2.5 font-semibold text-[11px] text-fd-muted-foreground uppercase tracking-wider">
        Quick Navigation
      </div>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(LOCATIONS).map(([name, loc]) => (
          <button
            className="cursor-pointer rounded-full border border-fd-border bg-fd-secondary px-2.5 py-1.5 text-[11px] text-fd-secondary-foreground hover:border-fd-ring hover:text-fd-foreground"
            key={name}
            onClick={() => onNavigate(loc)}
            type="button"
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
