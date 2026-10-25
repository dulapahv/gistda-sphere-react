import { type CSSProperties, useEffect, useRef } from "react";
import { useDeepMemo } from "@/internal/hooks";
import { useActiveMap } from "@/internal/useActiveMap";
import type { Icon } from "@/types";

export interface SearchResultsProps {
  className?: string;
  /** Result marker icon, or `false` to list results without markers. */
  icon?: Icon | false;
  style?: CSSProperties;
}

/**
 * Renders Sphere's built-in search result list. Results of
 * `useSearch().search()` appear here with markers on the map. Can be
 * placed anywhere inside `SphereProvider`.
 */
export function SearchResults({ className, icon, style }: SearchResultsProps) {
  const { map, isReady } = useActiveMap();
  const containerRef = useRef<HTMLDivElement>(null);
  const stableIcon = useDeepMemo(icon);

  useEffect(() => {
    const container = containerRef.current;
    if (!(isReady && map && container)) {
      return;
    }
    map.Search.placeholder(
      container,
      stableIcon === undefined ? undefined : { icon: stableIcon }
    );
    return () => {
      map.Search.clear();
      if (map.Search.placeholder() === container) {
        map.Search.placeholder(document.createElement("div"));
      }
    };
  }, [isReady, map, stableIcon]);

  return <div className={className} ref={containerRef} style={style} />;
}
