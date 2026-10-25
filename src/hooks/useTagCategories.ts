import { useEffect, useMemo, useState } from "react";
import { useSphereContext } from "@/context/SphereContext";
import { createSphereServices } from "@/services/client";
import type { TagCategoryInfo } from "@/services/types";
import type { Language } from "@/types";
import type { TagCategory } from "./useTags";

/** A tag category from the live list, labeled in one language. */
export interface LocalizedTagCategory extends TagCategory {
  /** Icon key of the category. */
  icon: string;
}

export interface UseTagCategoriesReturn {
  /** Categories with labels in the requested language (empty until loaded). */
  categories: LocalizedTagCategory[];
  error: Error | null;
  isLoading: boolean;
}

/** Shared request so every component reuses one fetch per page. */
let categoriesRequest: Promise<TagCategoryInfo[]> | null = null;

/** Clears the shared request (internal; used by tests). */
export function resetTagCategoriesCache(): void {
  categoriesRequest = null;
}

/** Fetches the category list once, retrying on the next call after a failure. */
function loadCategories(apiKey: string): Promise<TagCategoryInfo[]> {
  if (!categoriesRequest) {
    categoriesRequest = createSphereServices({ apiKey })
      .tags.categories()
      .catch((error: unknown) => {
        categoriesRequest = null;
        throw error;
      });
  }
  return categoriesRequest;
}

/**
 * Converts the API shape into labeled categories. The live list repeats a
 * few tags within a category under different English names; the tag ID
 * (the Thai name) is what selects POIs, so each ID is kept once.
 */
function localize(
  categories: TagCategoryInfo[],
  language: Language
): LocalizedTagCategory[] {
  return categories.map((category) => {
    const seen = new Set<string>();
    const tags: TagCategory["tags"] = [];
    for (const tag of category.sub ?? []) {
      if (!seen.has(tag.name.th)) {
        seen.add(tag.name.th);
        tags.push({ id: tag.name.th, label: tag.name[language] });
      }
    }
    return { icon: category.icon, name: category.name[language], tags };
  });
}

/**
 * Every POI tag category available in Sphere (about 260 tags in 20
 * categories), fetched from the public category list. Tag `id`s are the
 * names to pass to `useTags().add()` or `<Tag name>`.
 */
export function useTagCategories(
  language: Language = "en"
): UseTagCategoriesReturn {
  const { apiKey } = useSphereContext();
  const [data, setData] = useState<TagCategoryInfo[] | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    loadCategories(apiKey)
      .then((result) => {
        if (active) {
          setData(result);
          setError(null);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error ? reason : new Error(String(reason))
          );
        }
      });
    return () => {
      active = false;
    };
  }, [apiKey]);

  const categories = useMemo(
    () => (data ? localize(data, language) : []),
    [data, language]
  );

  return { categories, error, isLoading: data === null && error === null };
}
