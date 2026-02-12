"use client";

import type { Location } from "gistda-sphere-react";
import { LOCATIONS } from "../constants";
import { getTranslations } from "../translations";

interface QuickNavProps {
  onNavigate: (location: Location, zoom?: number) => void;
  lang: string;
}

export function QuickNav({ onNavigate, lang }: QuickNavProps) {
  const t = getTranslations(lang);

  const locationLabels: Record<string, string> = {
    Bangkok: t.locBangkok,
    "Chiang Mai": t.locChiangMai,
    Phuket: t.locPhuket,
    Pattaya: t.locPattaya,
    Ayutthaya: t.locAyutthaya,
    Sukhothai: t.locSukhothai,
  };

  return (
    <div className="mb-4">
      <div className="mb-2.5 font-semibold text-[11px] text-fd-muted-foreground uppercase tracking-wider">
        {t.quickNavigation}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(LOCATIONS).map(([name, loc]) => (
          <button
            className="cursor-pointer rounded-full border border-fd-border bg-fd-secondary px-2.5 py-1.5 text-[11px] text-fd-secondary-foreground hover:border-fd-ring hover:text-fd-foreground"
            key={name}
            onClick={() => onNavigate(loc)}
            type="button"
          >
            {locationLabels[name] ?? name}
          </button>
        ))}
      </div>
    </div>
  );
}
