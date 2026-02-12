"use client";

import { LANGUAGES, type MapLanguage } from "../constants";
import { getTranslations } from "../translations";

interface LanguageSelectorProps {
  language: MapLanguage;
  onLanguageChange: (language: MapLanguage) => void;
  lang: string;
}

export function LanguageSelector({
  language,
  onLanguageChange,
  lang,
}: LanguageSelectorProps) {
  const t = getTranslations(lang);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-semibold text-[11px] text-fd-muted-foreground uppercase tracking-wider">
        {t.language}
      </span>
      <div className="flex gap-1.5">
        {LANGUAGES.map((mapLang) => (
          <button
            className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs ${
              language === mapLang.id
                ? "border-fd-primary bg-fd-primary text-fd-primary-foreground"
                : "border-fd-border bg-fd-secondary text-fd-secondary-foreground hover:border-fd-ring hover:bg-fd-accent hover:text-fd-foreground"
            }`}
            key={mapLang.id}
            onClick={() => onLanguageChange(mapLang.id as MapLanguage)}
            type="button"
          >
            <mapLang.icon className="h-3.5 w-3.5" size={14} />
            <span className="font-medium">{mapLang.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
