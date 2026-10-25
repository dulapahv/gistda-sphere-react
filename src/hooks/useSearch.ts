import { useMemo } from "react";
import { useActiveMap } from "@/internal/useActiveMap";
import type {
  AddressOptions,
  AddressResult,
  Language,
  Location,
  NearPoiOptions,
  PoiResult,
  SearchOptions,
  SearchResponse,
  SearchUiOptions,
  SuggestOptions,
  SuggestResult,
} from "@/types";

/** Search results (`data` holds the places). */
export type SearchResult = SearchResponse<PoiResult>;

/** Suggestion results (`data` holds the suggestions). */
export type SuggestResponse = SearchResponse<SuggestResult>;

export interface UseSearchReturn {
  /**
   * Reverse geocode a location. Resolves `null` when there is no address
   * there or the API key does not have the address service enabled.
   */
  address: (
    location: Location,
    options?: AddressOptions
  ) => Promise<AddressResult | null>;
  /** Clear results shown by the built-in results list. */
  clear: () => void;
  /** Show popups for searched POIs. */
  enablePopup: (state: boolean) => void;
  getLanguage: () => Language | null;
  isPopupEnabled: () => boolean | null;
  isReady: boolean;
  /** Places near a location. */
  nearPoi: (
    location: Location,
    options?: NearPoiOptions
  ) => Promise<PoiResult[]>;
  /** Search places by keyword. */
  search: (keyword: string, options?: SearchOptions) => Promise<SearchResult>;
  setLanguage: (lang: Language) => void;
  /** Render the built-in result list into an element (see also `<SearchResults>`). */
  setPlaceholder: (element: HTMLElement, options?: SearchUiOptions) => void;
  /** Autocomplete suggestions for a partial keyword. */
  suggest: (
    keyword: string,
    options?: SuggestOptions
  ) => Promise<SuggestResponse>;
}

/** Error raised when a search service returns no response at all. */
function noResponse(service: string): Error {
  return new Error(
    `The Sphere ${service} service returned no data. Check your connection and that your API key has the ${service} service enabled.`
  );
}

/**
 * Place search, autocomplete, reverse geocoding and nearby POIs through the
 * map's search service. Works inside `SphereMap` and anywhere else under
 * `SphereProvider`. For calls without a map, see `useSphereServices`.
 */
export function useSearch(): UseSearchReturn {
  const { map, isReady } = useActiveMap();

  return useMemo<UseSearchReturn>(() => {
    const requireSearch = () => {
      if (!map?.Search) {
        throw new Error("Search API not available: the map is not ready yet.");
      }
      return map.Search;
    };

    return {
      address: async (location, options) =>
        (await requireSearch().address(location, options)) ?? null,
      clear: () => {
        map?.Search?.clear();
      },
      enablePopup: (state) => {
        map?.Search?.enablePopup(state);
      },
      getLanguage: () => {
        const value = map?.Search?.language();
        return value === "th" || value === "en" ? value : null;
      },
      isPopupEnabled: () => {
        const value = map?.Search?.enablePopup();
        return typeof value === "boolean" ? value : null;
      },
      isReady,
      nearPoi: async (location, options) => {
        const result = await requireSearch().nearPoi(location, options);
        if (!result) {
          throw noResponse("POI");
        }
        return result.data;
      },
      search: async (keyword, options) => {
        const result = await requireSearch().search(keyword, options);
        if (!result) {
          throw noResponse("search");
        }
        return result;
      },
      setLanguage: (lang) => {
        map?.Search?.language(lang);
      },
      setPlaceholder: (element, options) => {
        map?.Search?.placeholder(element, options);
      },
      suggest: async (keyword, options) => {
        const result = await requireSearch().suggest(keyword, options);
        if (!result) {
          throw noResponse("search");
        }
        return result;
      },
    };
  }, [map, isReady]);
}
