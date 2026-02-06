import { useCallback, useMemo } from "react";
import { useMap } from "../context/SphereContext";
import type { TagOptions, Tile } from "../types";

export type TagDataFunction = (tile: Tile) => object[];

export interface UseTagsReturn {
  isReady: boolean;
  set: (tag: string | TagDataFunction, options?: TagOptions) => void;
  add: (tag: string | TagDataFunction, options?: TagOptions) => void;
  remove: (tag: string) => void;
  clear: () => void;
  list: () => string[];
  size: () => number;
  enablePopup: (state: boolean) => void;
  setLanguage: (lang: string) => void;
}

export interface TagDefinition {
  id: string;
  label: string;
}

export interface TagCategory {
  name: string;
  tags: TagDefinition[];
}

export const TAG_CATEGORIES: TagCategory[] = [
  {
    name: "Food & Dining",
    tags: [
      { id: "อาหารไทย", label: "Thai Food" },
      { id: "อาหารญี่ปุ่น", label: "Japanese" },
      { id: "อาหารจีน", label: "Chinese" },
      { id: "อาหารเกาหลี", label: "Korean" },
      { id: "อาหารเวียดนาม", label: "Vietnamese" },
      { id: "อาหารอินเดีย", label: "Indian" },
      { id: "อาหารอิตาลี", label: "Italian" },
      { id: "อาหารฝรั่งเศส", label: "French" },
      { id: "อาหารเยอรมัน", label: "German" },
      { id: "อาหารยุโรป", label: "European" },
    ],
  },
  {
    name: "Services",
    tags: [
      { id: "ธนาคาร", label: "Bank" },
      { id: "ATM", label: "ATM" },
      { id: "โรงพยาบาล", label: "Hospital" },
      { id: "ปั๊มน้ำมัน", label: "Gas Station" },
    ],
  },
  {
    name: "Tourism",
    tags: [
      { id: "โรงแรม", label: "Hotel" },
      { id: "วัด", label: "Temple" },
      { id: "พิพิธภัณฑ์", label: "Museum" },
      { id: "ห้างสรรพสินค้า", label: "Shopping Mall" },
    ],
  },
];

export function useTags(): UseTagsReturn {
  const { map, isReady } = useMap();

  const set = useCallback(
    (tag: string | TagDataFunction, options?: TagOptions) => {
      map?.Tags?.set(tag, options);
    },
    [map]
  );

  const add = useCallback(
    (tag: string | TagDataFunction, options?: TagOptions) => {
      map?.Tags?.add(tag, options);
    },
    [map]
  );

  const remove = useCallback(
    (tag: string) => {
      map?.Tags?.remove(tag);
    },
    [map]
  );

  const clear = useCallback(() => {
    map?.Tags?.clear();
  }, [map]);

  const list = useCallback((): string[] => {
    return map?.Tags?.list() ?? [];
  }, [map]);

  const size = useCallback((): number => {
    return map?.Tags?.size() ?? 0;
  }, [map]);

  const enablePopup = useCallback(
    (state: boolean) => {
      map?.Tags?.enablePopup(state);
    },
    [map]
  );

  const setLanguage = useCallback(
    (lang: string) => {
      map?.Tags?.language(lang);
    },
    [map]
  );

  return useMemo(
    () => ({
      isReady,
      set,
      add,
      remove,
      clear,
      list,
      size,
      enablePopup,
      setLanguage,
    }),
    [isReady, set, add, remove, clear, list, size, enablePopup, setLanguage]
  );
}
