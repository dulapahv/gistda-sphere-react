import type { Location } from "gistda-sphere-react";
import { useSearch } from "gistda-sphere-react";
import { MapPin, Search, X } from "lucide-react";
import { useState } from "react";
import type { SearchMarkerData } from "../types";
import "./SearchPanel.css";

interface SearchPanelProps {
  onResultSelect: (marker: SearchMarkerData) => void;
}

export function SearchPanel({ onResultSelect }: SearchPanelProps) {
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
    } catch (err) {
      console.error("Search error:", err);
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
    } catch (err) {
      console.error("Suggest error:", err);
    }
  };

  const handleResultClick = (item: object) => {
    const poi = item as { name?: string; lat?: number; lon?: number };
    if (poi.lat !== undefined && poi.lon !== undefined) {
      const position: Location = { lat: poi.lat, lon: poi.lon };
      onResultSelect({ position, name: poi.name ?? "Search Result" });
    }
  };

  const handleClear = () => {
    setResults([]);
    setSuggestions([]);
    setKeyword("");
    clear();
  };

  return (
    <div className="panel-section">
      <div className="section-header">Search Places</div>
      <div className="input-group">
        <input
          className="input"
          onChange={(e) => handleSuggest(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search for places..."
          type="text"
          value={keyword}
        />
        <button
          className="btn btn-primary btn-icon"
          disabled={loading || !isReady}
          onClick={handleSearch}
          type="button"
        >
          <Search size={16} />
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="suggestions-list">
          {suggestions.map((s, i) => {
            const name = (s as { name?: string }).name ?? "";
            return (
              <button
                className="suggestion-item"
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
        <div className="results-list">
          {results.slice(0, 5).map((r, i) => {
            const item = r as { name?: string; id?: string };
            return (
              <button
                className="result-item"
                key={item.id || item.name || `result-${i}`}
                onClick={() => handleResultClick(r)}
                type="button"
              >
                <MapPin size={14} />
                <span>{item.name ?? `Result ${i + 1}`}</span>
              </button>
            );
          })}
          <button className="btn btn-sm" onClick={handleClear} type="button">
            <X size={14} /> Clear Results
          </button>
        </div>
      )}
    </div>
  );
}
