import { type CSSProperties, useEffect, useRef } from "react";
import { useActiveMap } from "@/internal/useActiveMap";

export interface RouteGuideProps {
  className?: string;
  style?: CSSProperties;
}

/**
 * Renders Sphere's built-in route guide (turn-by-turn list, distance and
 * travel time) for the map's route. Can be placed anywhere inside
 * `SphereProvider`, e.g. in a sidebar. Use `useRoute` to plan the route.
 *
 * Note: attaching a guide also turns on automatic re-routing when
 * destinations change, matching the Sphere API's behavior.
 */
export function RouteGuide({ className, style }: RouteGuideProps) {
  const { map, isReady } = useActiveMap();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!(isReady && map && container)) {
      return;
    }
    map.Route.placeholder(container);
    return () => {
      // Sphere cannot detach a placeholder; point it at a detached element.
      if (map.Route.placeholder() === container) {
        map.Route.placeholder(document.createElement("div"));
      }
    };
  }, [isReady, map]);

  return <div className={className} ref={containerRef} style={style} />;
}
