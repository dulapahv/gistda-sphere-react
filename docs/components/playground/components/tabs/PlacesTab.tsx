"use client";

import {
  BoundingBoxIcon,
  ChatCircleTextIcon,
  FrameCornersIcon,
  GpsFixIcon,
  ListIcon,
  MagnifyingGlassIcon,
  MapPinAreaIcon,
  PathIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import {
  type AddressResult,
  type Language,
  type Location,
  type PoiResult,
  SearchResults,
  TAG_CATEGORIES,
  useMapControls,
  useSearch,
  useSuggest,
  useTagCategories,
  useTags,
} from "gistda-sphere-react";
import { useState } from "react";
import type { PlaygroundTranslations } from "../../translations";
import type { SelectedPlace } from "../../types";
import { formatLocation } from "../MapCards";
import {
  Button,
  ErrorNote,
  Hint,
  Panel,
  Row,
  Section,
  TextInput,
  Toggle,
} from "../ui";

/** Error text from an unknown rejection. */
function messageOf(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}

/** One-line address from a reverse-geocoding result. */
function formatAddress(result: AddressResult): string {
  const parts = [
    result.road,
    result.subdistrict,
    result.district,
    result.province,
    result.postcode,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : String(result.address ?? "");
}

/** A clickable list of places. */
function PlaceList({
  numbered,
  onSelect,
  places,
}: {
  numbered?: boolean;
  onSelect: (poi: PoiResult) => void;
  places: PoiResult[];
}) {
  return (
    <ol className="m-0 mt-2 flex list-none flex-col gap-1 p-0">
      {places.map((poi, index) => (
        <li key={poi.id}>
          <button
            className="flex w-full cursor-pointer items-start gap-2 rounded-md border border-fd-border bg-fd-secondary px-2 py-1.5 text-left text-xs hover:border-fd-ring hover:bg-fd-accent"
            onClick={() => onSelect(poi)}
            type="button"
          >
            <span className="mt-px w-4 shrink-0 text-right text-fd-muted-foreground tabular-nums">
              {numbered ? index + 1 : "•"}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-fd-foreground">
                {poi.name}
              </span>
              {poi.address ? (
                <span className="block truncate text-[11px] text-fd-muted-foreground">
                  {poi.address}
                </span>
              ) : null}
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}

/** Places tab: search, nearby places, reverse geocoding and POI tags. */
export function PlacesTab({
  activeTags,
  language,
  nearbyPlaces,
  onAddRouteStop,
  onClearTags,
  onNearbyChange,
  onSelectPlace,
  onToggleTag,
  outlineFailed,
  selectedPlace,
  t,
}: {
  activeTags: string[];
  language: Language;
  nearbyPlaces: PoiResult[];
  onAddRouteStop: (location: Location) => void;
  onClearTags: () => void;
  onNearbyChange: (places: PoiResult[]) => void;
  onSelectPlace: (place: SelectedPlace | null) => void;
  onToggleTag: (tag: string) => void;
  /** The selected place's outline did not load. */
  outlineFailed: boolean;
  selectedPlace: SelectedPlace | null;
  t: PlaygroundTranslations;
}) {
  const search = useSearch();
  const tags = useTags();
  const {
    categories,
    error: categoriesError,
    isLoading,
  } = useTagCategories(language);
  const { getCenter, goTo } = useMapControls();

  const [keyword, setKeyword] = useState("");
  // Suggestions show while users type, and hide once a search runs.
  const [isTyping, setIsTyping] = useState(false);
  const { suggestions } = useSuggest(isTyping ? keyword : "", { limit: 6 });
  const [results, setResults] = useState<PoiResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showBuiltInList, setShowBuiltInList] = useState(false);
  const [nearbyBusy, setNearbyBusy] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [addressBusy, setAddressBusy] = useState(false);
  const [tagPopups, setTagPopups] = useState(true);

  const runSearch = async (text = keyword) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    setIsTyping(false);
    setSearching(true);
    setSearchError(null);
    try {
      const response = await search.search(trimmed, { limit: 10 });
      setResults(response.data);
      if (response.data.length === 0) {
        setSearchError(t.places.noResults(trimmed));
      }
    } catch (reason) {
      setSearchError(messageOf(reason));
    } finally {
      setSearching(false);
    }
  };

  const selectPlace = (poi: PoiResult) => {
    onSelectPlace({ poi, showOutline: false });
    goTo({ center: { lat: poi.lat, lon: poi.lon }, zoom: 16 });
  };

  const clearSearch = () => {
    setKeyword("");
    setResults([]);
    setIsTyping(false);
    setSearchError(null);
    onSelectPlace(null);
    search.clear();
  };

  const findNearby = async () => {
    const center = getCenter();
    if (!center) {
      return;
    }
    setNearbyBusy(true);
    setNearbyError(null);
    try {
      const places = await search.nearPoi(center, { limit: 10 });
      onNearbyChange(places);
      if (places.length === 0) {
        setNearbyError(t.places.noNearby);
      }
    } catch (reason) {
      setNearbyError(messageOf(reason));
    } finally {
      setNearbyBusy(false);
    }
  };

  const lookUpAddress = async () => {
    const center = getCenter();
    if (!center) {
      return;
    }
    setAddressBusy(true);
    try {
      const result = await search.address(center);
      setAddress(
        result
          ? `${formatAddress(result)} (${formatLocation(center, 4)})`
          : t.places.noAddress
      );
    } catch (reason) {
      setAddress(messageOf(reason));
    } finally {
      setAddressBusy(false);
    }
  };

  const toggleTagPopups = () => {
    tags.enablePopup(!tagPopups);
    setTagPopups(!tagPopups);
  };

  const tagCategories = categories.length > 0 ? categories : TAG_CATEGORIES;
  const selectedPoi = selectedPlace?.poi;

  return (
    <>
      <Section hint={t.places.searchHint} title={t.places.search}>
        <div className="flex gap-1.5">
          <TextInput
            label={t.places.search}
            onChange={(value) => {
              setKeyword(value);
              setIsTyping(true);
            }}
            onEnter={() => runSearch()}
            placeholder={t.places.searchPlaceholder}
            value={keyword}
          />
          <Button
            busy={searching}
            disabled={!search.isReady || keyword.trim() === ""}
            icon={MagnifyingGlassIcon}
            onClick={() => runSearch()}
            primary
            title={t.places.search}
          />
          <Button icon={XIcon} onClick={clearSearch} title={t.common.clear} />
        </div>
        {suggestions.length > 0 ? (
          <ul className="m-0 mt-1 list-none overflow-hidden rounded-md border border-fd-border bg-fd-popover p-0 shadow-sm">
            {suggestions.map((suggestion, index) => (
              // Sphere can suggest the same name twice.
              // biome-ignore lint/suspicious/noArrayIndexKey: suggestions have no IDs
              <li key={`${suggestion.name}:${index}`}>
                <button
                  className="w-full cursor-pointer px-2 py-1.5 text-left text-xs hover:bg-fd-accent"
                  onClick={() => {
                    setKeyword(suggestion.name);
                    runSearch(suggestion.name);
                  }}
                  type="button"
                >
                  {suggestion.name}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {searchError ? <ErrorNote>{searchError}</ErrorNote> : null}
        {results.length > 0 ? (
          <PlaceList onSelect={selectPlace} places={results} />
        ) : null}
        <div className="mt-2">
          <Toggle
            active={showBuiltInList}
            icon={ListIcon}
            label={t.places.builtInList}
            onClick={() => setShowBuiltInList(!showBuiltInList)}
          />
        </div>
        {showBuiltInList ? (
          <>
            <Hint>{t.places.builtInListHint}</Hint>
            <SearchResults className="mt-2 max-h-72 overflow-y-auto rounded-md border border-fd-border bg-white text-black text-xs" />
          </>
        ) : null}
      </Section>

      {selectedPoi ? (
        <Section title={t.places.selected}>
          <Panel>
            <p className="m-0 font-medium text-sm">{selectedPoi.name}</p>
            {selectedPoi.address ? (
              <p className="m-0 mt-0.5 text-fd-muted-foreground text-xs">
                {selectedPoi.address}
              </p>
            ) : null}
            <div className="mt-2">
              <Row>
                <Button
                  icon={FrameCornersIcon}
                  label={t.places.zoomTo}
                  onClick={() =>
                    goTo({
                      center: { lat: selectedPoi.lat, lon: selectedPoi.lon },
                      zoom: 16,
                    })
                  }
                />
                <Toggle
                  active={selectedPlace?.showOutline ?? false}
                  icon={BoundingBoxIcon}
                  label={t.places.outline}
                  onClick={() =>
                    onSelectPlace({
                      poi: selectedPoi,
                      showOutline: !selectedPlace?.showOutline,
                    })
                  }
                />
                <Button
                  icon={PathIcon}
                  label={t.places.routeHere}
                  onClick={() =>
                    onAddRouteStop({
                      lat: selectedPoi.lat,
                      lon: selectedPoi.lon,
                    })
                  }
                />
              </Row>
            </div>
          </Panel>
          {outlineFailed && selectedPlace?.showOutline ? (
            <ErrorNote>{t.places.outlineFailed}</ErrorNote>
          ) : (
            <Hint>{t.places.outlineHint}</Hint>
          )}
        </Section>
      ) : null}

      <Section hint={t.places.nearbyHint} title={t.places.nearby}>
        <Row>
          <Button
            busy={nearbyBusy}
            disabled={!search.isReady}
            icon={MapPinAreaIcon}
            label={t.places.findNearby}
            onClick={findNearby}
          />
          <Button
            busy={addressBusy}
            disabled={!search.isReady}
            icon={GpsFixIcon}
            label={t.places.whatsHere}
            onClick={lookUpAddress}
          />
          {nearbyPlaces.length > 0 ? (
            <Button
              icon={TrashIcon}
              label={t.common.clear}
              onClick={() => onNearbyChange([])}
            />
          ) : null}
        </Row>
        {address ? (
          <Panel>
            <p className="m-0 text-xs">{address}</p>
          </Panel>
        ) : null}
        {nearbyError ? <ErrorNote>{nearbyError}</ErrorNote> : null}
        {nearbyPlaces.length > 0 ? (
          <PlaceList numbered onSelect={selectPlace} places={nearbyPlaces} />
        ) : null}
      </Section>

      <Section hint={t.places.tagsHint} title={t.places.tags}>
        <Row>
          <Toggle
            active={tagPopups}
            icon={ChatCircleTextIcon}
            label={t.places.tagPopups}
            onClick={toggleTagPopups}
          />
          <Button
            disabled={activeTags.length === 0}
            icon={TrashIcon}
            label={t.places.clearTags(activeTags.length)}
            onClick={onClearTags}
          />
        </Row>
        {isLoading ? <Hint>{t.common.loading}</Hint> : null}
        {categoriesError ? <Hint>{t.places.tagsFallback}</Hint> : null}
        <div className="mt-2 flex flex-col gap-1">
          {tagCategories.map((category) => {
            const activeCount = category.tags.filter((tag) =>
              activeTags.includes(tag.id)
            ).length;
            return (
              <details
                className="rounded-md border border-fd-border bg-fd-secondary px-2 py-1.5 text-xs"
                key={category.name}
              >
                <summary className="cursor-pointer select-none font-medium">
                  {category.name}
                  <span className="ml-1 font-normal text-fd-muted-foreground">
                    ({category.tags.length}
                    {activeCount
                      ? ` · ${t.places.activeCount(activeCount)}`
                      : ""}
                    )
                  </span>
                </summary>
                <div className="mt-2 flex flex-wrap gap-1">
                  {category.tags.map((tag) => (
                    <Toggle
                      active={activeTags.includes(tag.id)}
                      disabled={!tags.isReady}
                      key={tag.id}
                      label={tag.label}
                      onClick={() => onToggleTag(tag.id)}
                    />
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </Section>
    </>
  );
}
