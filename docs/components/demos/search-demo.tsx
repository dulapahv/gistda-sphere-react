"use client";

import {
  type Location,
  Marker,
  SphereMap,
  SphereProvider,
  useMapControls,
  useSearch,
} from "gistda-sphere-react";
import { useState } from "react";

const API_KEY = process.env.NEXT_PUBLIC_SPHERE_API_KEY ?? "";

/** Inner search component that uses hooks. */
function SearchControls() {
  const { search, clear, isReady } = useSearch();
  const { goTo } = useMapControls();
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<
    Array<{ name?: string; lat?: number; lon?: number }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<Location | null>(null);

  const handleSearch = async () => {
    if (!(keyword.trim() && isReady)) {
      return;
    }
    setLoading(true);
    try {
      const result = await search(keyword, { limit: 5 });
      setResults(
        ((result as { data?: object[] }).data ?? []) as typeof results
      );
    } catch {
      /* search failed */
    }
    setLoading(false);
  };

  const handleSelect = (item: (typeof results)[number]) => {
    if (item.lat !== undefined && item.lon !== undefined) {
      const pos: Location = { lat: item.lat, lon: item.lon };
      setSelectedMarker(pos);
      goTo({ center: pos, zoom: 16 });
    }
  };

  const handleClear = () => {
    setResults([]);
    setKeyword("");
    setSelectedMarker(null);
    clear();
  };

  return (
    <>
      <SphereMap
        center={{ lon: 100.5018, lat: 13.7563 }}
        language="en"
        style={{ width: "100%", height: "400px" }}
        zoom={10}
      >
        {selectedMarker && (
          <Marker position={selectedMarker} title="Search Result" />
        )}
      </SphereMap>
      <div className="flex flex-wrap items-center gap-2 bg-fd-card p-3">
        <input
          className="flex-1 rounded-md border border-fd-border bg-fd-secondary px-2 py-1.5 text-fd-secondary-foreground text-xs placeholder:text-fd-muted-foreground focus:border-fd-ring focus:outline-none"
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder="Search for places (e.g. พระบรมมหาราชวัง, สวนกุหลาบวิทยาลัย)..."
          type="text"
          value={keyword}
        />
        <button
          className="cursor-pointer rounded-md border border-fd-primary bg-fd-primary px-2 py-1.5 text-fd-primary-foreground text-xs disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading || !isReady}
          onClick={handleSearch}
          type="button"
        >
          Search
        </button>
        {results.length > 0 && (
          <button
            className="cursor-pointer rounded-md border border-fd-border bg-fd-secondary px-2 py-1.5 text-fd-secondary-foreground text-xs hover:bg-fd-accent disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleClear}
            type="button"
          >
            Clear
          </button>
        )}
      </div>
      {results.length > 0 && (
        <div className="flex flex-col gap-2 bg-fd-card p-3 pt-0">
          {results.map((r, i) => (
            <button
              className="flex w-full cursor-pointer items-center gap-2 rounded-md border border-fd-border bg-fd-secondary px-2 py-1.5 text-left text-fd-foreground text-xs hover:bg-fd-accent"
              key={r.name || `r-${i}`}
              onClick={() => handleSelect(r)}
              type="button"
            >
              {r.name ?? `Result ${i + 1}`}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/** Interactive search demo with input, results list, and map. */
export function SearchDemo() {
  if (!API_KEY) {
    return null;
  }

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-fd-border">
      <SphereProvider apiKey={API_KEY}>
        <SearchControls />
      </SphereProvider>
    </div>
  );
}
