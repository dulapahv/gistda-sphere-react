import { useEffect } from "react";
import { useMapContext } from "@/context/MapContext";
import { useSphereContext } from "@/context/SphereContext";
import { useDeepMemo } from "@/internal/hooks";
import { removeTags } from "@/internal/tags";
import type { TagOptions } from "@/types";

export interface TagProps extends TagOptions {
  /**
   * Tag name, e.g. `"โรงพยาบาล"` (see `useTagCategories` for all tags).
   * Separate several tags with commas to show them as one layer
   * (`"โรงพยาบาล,วัด"`) or with `|` for separate layers. `"%"` shows every
   * POI. For WFS/OGC sources (`type`), the name of the data layer or
   * collection.
   */
  name: string;
}

/**
 * Shows a POI tag layer while mounted. All `TagOptions` are accepted as
 * props, including WFS/OGC sources and deck.gl layer props.
 */
export function Tag({ name, ...options }: TagProps): null {
  const { map, isReady } = useMapContext();
  const { sphere } = useSphereContext();
  const stableOptions = useDeepMemo(options);

  useEffect(() => {
    if (!(isReady && map && sphere)) {
      return;
    }
    const tagOptions = Object.keys(stableOptions).length
      ? stableOptions
      : undefined;
    map.Tags.add(name, tagOptions);
    return () => {
      removeTags(map, name);
    };
  }, [isReady, map, sphere, name, stableOptions]);

  return null;
}
