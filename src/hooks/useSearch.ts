import { useCallback, useMemo } from "react";
import { useMap } from "../context/SphereContext";
import type {
  AddressOptions,
  Language,
  Location,
  NearPoiOptions,
  SearchOptions,
  SuggestOptions,
} from "../types";

export interface SearchResult {
  data: object[];
  total?: number;
}

export interface AddressResult {
  address?: string;
  district?: string;
  geocode?: string;
  postcode?: string;
  province?: string;
  subdistrict?: string;
}

export interface PoiResult {
  category?: string;
  distance?: number;
  id: string;
  location: Location;
  name: string;
}

export interface UseSearchReturn {
  address: (
    location: Location,
    options?: AddressOptions
  ) => Promise<AddressResult>;
  clear: () => void;
  enablePopup: (state: boolean) => void;
  isReady: boolean;
  nearPoi: (
    location: Location,
    options?: NearPoiOptions
  ) => Promise<PoiResult[]>;
  search: (keyword: string, options?: SearchOptions) => Promise<SearchResult>;
  setLanguage: (lang: Language) => void;
  suggest: (keyword: string, options?: SuggestOptions) => Promise<SearchResult>;
}

export function useSearch(): UseSearchReturn {
  const { map, isReady } = useMap();

  const suggest = useCallback(
    async (
      keyword: string,
      options?: SuggestOptions
    ): Promise<SearchResult> => {
      if (!map?.Search) {
        throw new Error("Search API not available");
      }
      return (await map.Search.suggest(keyword, options)) as SearchResult;
    },
    [map]
  );

  const search = useCallback(
    async (keyword: string, options?: SearchOptions): Promise<SearchResult> => {
      if (!map?.Search) {
        throw new Error("Search API not available");
      }
      return (await map.Search.search(keyword, options)) as SearchResult;
    },
    [map]
  );

  const address = useCallback(
    async (
      location: Location,
      options?: AddressOptions
    ): Promise<AddressResult> => {
      if (!map?.Search) {
        throw new Error("Search API not available");
      }
      return (await map.Search.address(location, options)) as AddressResult;
    },
    [map]
  );

  const nearPoi = useCallback(
    async (
      location: Location,
      options?: NearPoiOptions
    ): Promise<PoiResult[]> => {
      if (!map?.Search) {
        throw new Error("Search API not available");
      }
      const result = await map.Search.nearPoi(location, options);
      return (result as { data?: PoiResult[] }).data ?? (result as PoiResult[]);
    },
    [map]
  );

  const clear = useCallback(() => {
    map?.Search?.clear();
  }, [map]);

  const enablePopup = useCallback(
    (state: boolean) => {
      map?.Search?.enablePopup(state);
    },
    [map]
  );

  const setLanguage = useCallback(
    (lang: Language) => {
      map?.Search?.language(lang);
    },
    [map]
  );

  return useMemo(
    () => ({
      isReady,
      suggest,
      search,
      address,
      nearPoi,
      clear,
      enablePopup,
      setLanguage,
    }),
    [
      isReady,
      suggest,
      search,
      address,
      nearPoi,
      clear,
      enablePopup,
      setLanguage,
    ]
  );
}
