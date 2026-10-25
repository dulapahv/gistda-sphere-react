"use client";

import {
  Marker,
  type PoiResult,
  SearchResults,
  SphereMap,
  useMapControls,
  useSearch,
  useSuggest,
} from "gistda-sphere-react";
import { useState } from "react";

/** Search with suggestions, a result list, and a marker with a React popup. */
export function PlaceSearch() {
  const { search, clear, isReady } = useSearch();
  const { goTo } = useMapControls();
  const [keyword, setKeyword] = useState("");
  // Suggestions show while users type, and hide once a search runs.
  const [isTyping, setIsTyping] = useState(false);
  const { suggestions } = useSuggest(isTyping ? keyword : "", { limit: 5 });
  const [results, setResults] = useState<PoiResult[] | null>(null);
  const [selected, setSelected] = useState<PoiResult | null>(null);
  const [showBuiltIn, setShowBuiltIn] = useState(false);

  const runSearch = async (value: string) => {
    setKeyword(value);
    setIsTyping(false);
    if (!value.trim()) {
      return;
    }
    try {
      const { data } = await search(value.trim(), { limit: 5 });
      setResults(data);
    } catch {
      setResults([]);
    }
  };

  const select = (place: PoiResult) => {
    setSelected(place);
    goTo({ center: { lat: place.lat, lon: place.lon }, zoom: 16 });
  };

  const reset = () => {
    setKeyword("");
    setIsTyping(false);
    setResults(null);
    setSelected(null);
    clear();
  };

  return (
    <>
      <SphereMap
        center={{ lat: 13.7563, lon: 100.5018 }}
        style={{ height: 400 }}
        zoom={11}
      >
        {selected ? (
          <Marker
            popupContent={
              <div>
                <p>{selected.address}</p>
                {selected.tel ? <p>{selected.tel}</p> : null}
              </div>
            }
            position={{ lat: selected.lat, lon: selected.lon }}
            title={selected.name}
          />
        ) : null}
      </SphereMap>
      <div className="controls">
        <input
          aria-label="Search places"
          onChange={(event) => {
            setKeyword(event.target.value);
            setIsTyping(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              runSearch(keyword);
            }
          }}
          placeholder="Search for places, e.g. Grand Palace or สวนลุมพินี"
          value={keyword}
        />
        <button
          disabled={!isReady}
          onClick={() => runSearch(keyword)}
          type="button"
        >
          Search
        </button>
        <button onClick={reset} type="button">
          Clear
        </button>
        <button
          aria-pressed={showBuiltIn}
          onClick={() => setShowBuiltIn(!showBuiltIn)}
          type="button"
        >
          Sphere's result list
        </button>
        {suggestions.map((suggestion, index) => (
          // Sphere can suggest the same name twice.
          <button
            key={`${suggestion.name}:${index}`}
            onClick={() => runSearch(suggestion.name)}
            type="button"
          >
            {suggestion.name}
          </button>
        ))}
        {results?.length === 0 ? <small>No places found.</small> : null}
        {results && results.length > 0 ? (
          <ul>
            {results.map((place) => (
              <li key={place.id}>
                <button onClick={() => select(place)} type="button">
                  <strong>{place.name}</strong> <small>{place.address}</small>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {showBuiltIn ? <SearchResults className="panel" /> : null}
      </div>
    </>
  );
}
