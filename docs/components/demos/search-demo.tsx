"use client";

import {
  Marker,
  type PoiResult,
  SearchResults,
  SphereMap,
  type SuggestResult,
  useMapControls,
  useSearch,
} from "gistda-sphere-react";
import { useEffect, useRef, useState } from "react";
import {
  DemoBar,
  DemoButton,
  DemoFrame,
  DemoNote,
  useDemoText,
} from "./demo-ui";
import { useDocLanguage } from "./use-doc-language";

const TEXT = {
  en: {
    builtIn: "Sphere's result list",
    clear: "Clear",
    noResults: "No places found.",
    placeholder: "Search for places, e.g. Grand Palace or สวนลุมพินี",
    search: "Search",
  },
  th: {
    builtIn: "รายการผลลัพธ์ของ Sphere",
    clear: "ล้าง",
    noResults: "ไม่พบสถานที่",
    placeholder: "ค้นหาสถานที่ เช่น พระบรมมหาราชวัง หรือ สวนลุมพินี",
    search: "ค้นหา",
  },
};

/** Search with suggestions, a result list and a marker with a React popup. */
function PlaceSearch() {
  const language = useDocLanguage();
  const text = useDemoText(TEXT);
  const { search, suggest, clear, isReady } = useSearch();
  const { goTo } = useMapControls();
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestResult[]>([]);
  const [results, setResults] = useState<PoiResult[] | null>(null);
  const [selected, setSelected] = useState<PoiResult | null>(null);
  const [showBuiltIn, setShowBuiltIn] = useState(false);
  const requestRef = useRef(0);

  // Suggestions while typing; older responses are ignored.
  useEffect(() => {
    const trimmed = keyword.trim();
    if (trimmed.length < 2 || !isReady) {
      setSuggestions([]);
      return;
    }
    requestRef.current += 1;
    const request = requestRef.current;
    const timer = setTimeout(async () => {
      try {
        const response = await suggest(trimmed, { limit: 5 });
        if (request === requestRef.current) {
          setSuggestions(response.data);
        }
      } catch {
        // Suggestions are optional.
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [keyword, isReady, suggest]);

  const runSearch = async (value = keyword) => {
    if (!value.trim()) {
      return;
    }
    requestRef.current += 1;
    setSuggestions([]);
    try {
      const response = await search(value.trim(), { limit: 5 });
      setResults(response.data);
    } catch {
      setResults([]);
    }
  };

  const select = (poi: PoiResult) => {
    setSelected(poi);
    goTo({ center: { lat: poi.lat, lon: poi.lon }, zoom: 16 });
  };

  const reset = () => {
    setKeyword("");
    setResults(null);
    setSuggestions([]);
    setSelected(null);
    clear();
  };

  return (
    <>
      <SphereMap
        center={{ lat: 13.7563, lon: 100.5018 }}
        language={language}
        style={{ height: "400px", width: "100%" }}
        zoom={11}
      >
        {selected ? (
          <Marker
            popupContent={
              <div className="text-xs">
                <p className="m-0">{selected.address}</p>
                {selected.tel ? <p className="m-0">{selected.tel}</p> : null}
              </div>
            }
            position={{ lat: selected.lat, lon: selected.lon }}
            title={selected.name}
          />
        ) : null}
      </SphereMap>
      <DemoBar>
        <input
          aria-label={text.search}
          className="min-w-0 flex-1 rounded-md border border-fd-border bg-fd-secondary px-2 py-1.5 text-fd-foreground text-xs placeholder:text-fd-muted-foreground focus:border-fd-ring focus:outline-none"
          onChange={(event) => setKeyword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              runSearch();
            }
          }}
          placeholder={text.placeholder}
          type="text"
          value={keyword}
        />
        <DemoButton disabled={!isReady} onClick={() => runSearch()}>
          {text.search}
        </DemoButton>
        <DemoButton onClick={reset}>{text.clear}</DemoButton>
        <DemoButton
          active={showBuiltIn}
          onClick={() => setShowBuiltIn(!showBuiltIn)}
        >
          {text.builtIn}
        </DemoButton>
        {suggestions.length > 0 ? (
          <div className="flex w-full flex-wrap gap-1">
            {suggestions.map((suggestion) => (
              <DemoButton
                key={suggestion.name}
                onClick={() => {
                  setKeyword(suggestion.name);
                  runSearch(suggestion.name);
                }}
              >
                {suggestion.name}
              </DemoButton>
            ))}
          </div>
        ) : null}
        {results?.length === 0 ? <DemoNote>{text.noResults}</DemoNote> : null}
        {results && results.length > 0 ? (
          <div className="flex w-full flex-col gap-1">
            {results.map((poi) => (
              <button
                className="w-full cursor-pointer rounded-md border border-fd-border bg-fd-secondary px-2 py-1.5 text-left text-fd-foreground text-xs hover:bg-fd-accent"
                key={poi.id}
                onClick={() => select(poi)}
                type="button"
              >
                <span className="font-medium">{poi.name}</span>
                {poi.address ? (
                  <span className="block text-fd-muted-foreground">
                    {poi.address}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
        {showBuiltIn ? (
          <SearchResults className="max-h-60 w-full overflow-y-auto rounded-md border border-fd-border bg-white text-black text-xs" />
        ) : null}
      </DemoBar>
    </>
  );
}

export function SearchDemo() {
  return (
    <DemoFrame height="480px">
      <PlaceSearch />
    </DemoFrame>
  );
}
