import { useMemo } from "react";
import { removeTags } from "@/internal/tags";
import { useActiveMap } from "@/internal/useActiveMap";
import type { Language, TagOptions, Tile } from "@/types";

/** Supplies custom tag data per map tile. */
export type TagDataFunction = (tile: Tile) => object[];

export interface UseTagsReturn {
  /** Add a tag (keeping existing ones). */
  add: (tag: string | TagDataFunction, options?: TagOptions) => void;
  /** Remove all tags. */
  clear: () => void;
  /** Show popups for tag POIs. */
  enablePopup: (state: boolean) => void;
  getLanguage: () => Language | null;
  isPopupEnabled: () => boolean | null;
  isReady: boolean;
  /** Names of the tags on the map. */
  list: () => string[];
  /** Remove a tag. Names joined with `|` are removed one by one. */
  remove: (tag: string) => void;
  /** Replace all tags with this one. */
  set: (tag: string | TagDataFunction, options?: TagOptions) => void;
  setLanguage: (lang: Language) => void;
  size: () => number;
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
      { id: "ธนาคาร/สถาบันการเงิน", label: "Bank" },
      { id: "เอทีเอ็ม", label: "ATM" },
      { id: "โรงพยาบาล", label: "Hospital" },
      { id: "สถานีบริการน้ำมัน", label: "Gas Station" },
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

/**
 * POI tag layers (categories of places such as banks or hospitals).
 * Works inside `SphereMap` and anywhere else under `SphereProvider`.
 * See also `<Tag>` and `useTagCategories`.
 */
export function useTags(): UseTagsReturn {
  const { map, isReady } = useActiveMap();

  return useMemo<UseTagsReturn>(
    () => ({
      add: (tag, options) => {
        map?.Tags?.add(tag, options);
      },
      clear: () => {
        map?.Tags?.clear();
      },
      enablePopup: (state) => {
        map?.Tags?.enablePopup(state);
      },
      getLanguage: () => {
        const value = map?.Tags?.language();
        return value === "th" || value === "en" ? value : null;
      },
      isPopupEnabled: () => {
        const value = map?.Tags?.enablePopup();
        return typeof value === "boolean" ? value : null;
      },
      isReady,
      list: () => map?.Tags?.list() ?? [],
      remove: (tag) => {
        if (map?.Tags) {
          removeTags(map, tag);
        }
      },
      set: (tag, options) => {
        map?.Tags?.set(tag, options);
      },
      setLanguage: (lang) => {
        map?.Tags?.language(lang);
      },
      size: () => map?.Tags?.size() ?? 0,
    }),
    [map, isReady]
  );
}
