"use client";

import type { Location } from "gistda-sphere-react";
import { useSearch } from "gistda-sphere-react";
import { MapPin, Search, X } from "lucide-react";
import { useState } from "react";
import { getTranslations } from "../translations";
import type { SearchMarkerData } from "../types";

interface SearchPanelProps {
  onResultSelect: (marker: SearchMarkerData) => void;
  lang: string;
}

/** Search panel with autocomplete suggestions and result display. */
export function SearchPanel({ onResultSelect, lang }: SearchPanelProps) {
  const t = getTranslations(lang);
  const { search: searchPlaces, suggest, clear, isReady } = useSearch();

  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<object[]>([]);
  const [suggestions, setSuggestions] = useState<object[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      return;
    }
    setLoading(true);
    try {
      const result = await searchPlaces(keyword, { limit: 10 });
      setResults((result as { data?: object[] }).data ?? []);
      setSuggestions([]);
    } catch {
      /* search failed silently */
    }
    setLoading(false);
  };

  const handleSuggest = async (value: string) => {
    setKeyword(value);
    if (value.length < 2 || !isReady) {
      setSuggestions([]);
      return;
    }
    try {
      const result = await suggest(value, { limit: 5 });
      setSuggestions((result as { data?: object[] }).data ?? []);
    } catch {
      /* suggest failed silently */
    }
  };

  const handleResultClick = (item: object) => {
    const poi = item as { name?: string; lat?: number; lon?: number };
    if (poi.lat !== undefined && poi.lon !== undefined) {
      const position: Location = { lat: poi.lat, lon: poi.lon };
      onResultSelect({ position, name: poi.name ?? t.searchResult });
    }
  };

  const handleClear = () => {
    setResults([]);
    setSuggestions([]);
    setKeyword("");
    clear();
  };

  return (
    <div className="mb-4">
      <div className="mb-2.5 font-semibold text-fd-muted-foreground text-xs uppercase tracking-wider">
        {t.searchPlaces}
      </div>
      <div className="flex gap-2">
        <input
          className="w-full flex-1 rounded-md border border-fd-border bg-fd-secondary px-2 py-1.5 text-fd-foreground text-xs placeholder:text-fd-muted-foreground focus:border-fd-ring focus:outline-none"
          onChange={(e) => handleSuggest(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder={t.searchPlaceholder}
          type="text"
          value={keyword}
        />
        <button
          aria-label={t.searchPlaces}
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-fd-primary bg-fd-primary p-0 text-fd-primary-foreground hover:border-white hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          disabled={loading || !isReady}
          onClick={handleSearch}
          type="button"
        >
          <Search size={16} />
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-2 overflow-hidden rounded-md border border-fd-border bg-fd-secondary">
          {suggestions.map((s, i) => {
            const name = (s as { name?: string }).name ?? "";
            return (
              <button
                className="w-full cursor-pointer border-0 border-fd-border border-b bg-transparent px-2 py-1.5 text-left text-fd-foreground text-xs last:border-b-0 hover:bg-fd-accent"
                key={name || `suggestion-${i}`}
                onClick={() => {
                  setKeyword(name);
                  setSuggestions([]);
                }}
                type="button"
              >
                {name}
              </button>
            );
          })}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-2.5 flex flex-col gap-1.5">
          {results.slice(0, 5).map((r, i) => {
            const item = r as { name?: string; id?: string };
            return (
              <button
                className="flex w-full cursor-pointer items-center gap-2 rounded-md border border-fd-border bg-fd-secondary px-2 py-1.5 text-left text-fd-foreground text-xs hover:border-fd-ring hover:bg-fd-accent"
                key={item.id || item.name || `result-${i}`}
                onClick={() => handleResultClick(r)}
                type="button"
              >
                <MapPin size={14} />
                <span>{item.name ?? t.resultN(i + 1)}</span>
              </button>
            );
          })}
          <button
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-fd-border bg-fd-secondary px-2.5 py-1.5 font-medium text-fd-foreground text-xs hover:border-fd-ring hover:bg-fd-accent"
            onClick={handleClear}
            type="button"
          >
            <X size={14} /> {t.clearResults}
          </button>
        </div>
      )}
    </div>
  );
}
