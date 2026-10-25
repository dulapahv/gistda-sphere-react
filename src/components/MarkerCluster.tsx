import {
  type CSSProperties,
  Fragment,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useMapContext } from "@/context/MapContext";
import {
  type Cluster,
  clusterPoints,
  expandBound,
  isInBound,
} from "@/internal/cluster";
import { useLatest } from "@/internal/hooks";
import type { Bound, Location } from "@/types";
import { Marker } from "./Marker";

export interface MarkerClusterProps<T> {
  /** Where each item is. */
  getPosition: (item: T) => Location;
  /** The points to show. Memoize large arrays. */
  items: readonly T[];
  /** Points never cluster above this zoom. Default `16`. */
  maxZoom?: number;
  /** Fewest points that form a cluster. Default `2`. */
  minPoints?: number;
  /** Replaces the default behavior of zooming in to the cluster's points. */
  onClusterClick?: (cluster: Cluster<T>) => void;
  /** How close points must be to cluster, in screen pixels. Default `60`. */
  radius?: number;
  /** Icon content of a cluster marker. Defaults to a bubble with the count. */
  renderCluster?: (cluster: Cluster<T>) => ReactNode;
  /** Renders an item that is not in a cluster, usually as a `<Marker>`. */
  renderMarker: (item: T, index: number) => ReactNode;
}

/**
 * How far outside the visible area markers are still rendered, as a share
 * of its width and height, so short pans don't reveal missing markers.
 */
const VIEW_MARGIN = 0.5;

/** The part of the map view that clustering depends on. */
interface ClusterView {
  bound: Bound;
  /** Whole zoom level: keeps clusters stable while users zoom a little. */
  zoom: number;
}

const BUBBLE_STYLE: CSSProperties = {
  alignItems: "center",
  background: "rgba(37, 99, 235, 0.9)",
  border: "2px solid white",
  borderRadius: "50%",
  boxShadow: "0 1px 4px rgba(0, 0, 0, 0.4)",
  boxSizing: "border-box",
  color: "white",
  cursor: "pointer",
  display: "flex",
  font: "600 12px/1 sans-serif",
  justifyContent: "center",
};

/** Bubble size in pixels: larger for bigger clusters. */
function bubbleSize(count: number): number {
  if (count < 10) {
    return 30;
  }
  return count < 100 ? 36 : 44;
}

/** The default cluster icon: a blue bubble showing the number of points. */
function ClusterBubble({ count }: { count: number }) {
  const size = bubbleSize(count);
  return (
    <div style={{ ...BUBBLE_STYLE, height: size, width: size }}>{count}</div>
  );
}

/** One cluster's marker. */
function ClusterMarker<T>({
  cluster,
  onOpen,
  renderCluster,
}: {
  cluster: Cluster<T>;
  onOpen: (cluster: Cluster<T>) => void;
  renderCluster?: (cluster: Cluster<T>) => ReactNode;
}) {
  const handleClick = useCallback(() => {
    onOpen(cluster);
  }, [onOpen, cluster]);
  return (
    <Marker onClick={handleClick} position={cluster.position}>
      {renderCluster ? (
        renderCluster(cluster)
      ) : (
        <ClusterBubble count={cluster.count} />
      )}
    </Marker>
  );
}

/**
 * Shows many points as markers, grouping nearby ones into numbered cluster
 * markers that split apart as users zoom in. Each item is rendered by
 * `renderMarker`, so markers keep React icons, popups and events. Points
 * are re-clustered when the zoom level changes, and only markers in or near
 * the visible area are rendered, so large datasets stay fast at any zoom.
 */
export function MarkerCluster<T>({
  items,
  getPosition,
  renderMarker,
  renderCluster,
  radius,
  maxZoom = 16,
  minPoints,
  onClusterClick,
}: MarkerClusterProps<T>): ReactNode {
  const { map, isReady } = useMapContext();
  const [view, setView] = useState<ClusterView | null>(null);
  const getPositionRef = useLatest(getPosition);

  useEffect(() => {
    if (!(isReady && map)) {
      return;
    }
    const update = () => {
      setView({ bound: map.bound(), zoom: Math.floor(map.zoom()) });
    };
    update();
    map.Renderer.on("moveend", update);
    return () => {
      map.Renderer.off("moveend", update);
    };
  }, [map, isReady]);

  // Only the zoom level matters here, so panning doesn't re-cluster.
  const zoom = view?.zoom ?? null;
  const result = useMemo(
    () =>
      zoom === null
        ? null
        : clusterPoints(items, (item) => getPositionRef.current(item), {
            maxZoom,
            minPoints,
            radius,
            zoom,
          }),
    [items, zoom, maxZoom, minPoints, radius, getPositionRef]
  );

  const visible = useMemo(() => {
    if (!(result && view)) {
      return null;
    }
    const area = expandBound(view.bound, VIEW_MARGIN);
    return {
      clusters: result.clusters.filter((cluster) =>
        isInBound(cluster.position, area)
      ),
      singles: result.singles.filter(({ item }) =>
        isInBound(getPositionRef.current(item), area)
      ),
    };
  }, [result, view, getPositionRef]);

  const openCluster = useCallback(
    (cluster: Cluster<T>) => {
      if (onClusterClick) {
        onClusterClick(cluster);
        return;
      }
      const { bound } = cluster;
      const isSinglePlace =
        bound.minLon === bound.maxLon && bound.minLat === bound.maxLat;
      if (isSinglePlace) {
        map?.goTo({ center: cluster.position, zoom: maxZoom + 1 });
      } else {
        map?.bound(bound, { maxZoom: maxZoom + 1, padding: 60 });
      }
    },
    [onClusterClick, map, maxZoom]
  );

  if (!visible) {
    return null;
  }
  return (
    <>
      {visible.clusters.map((cluster) => (
        <ClusterMarker
          cluster={cluster}
          key={`cluster:${cluster.key}`}
          onOpen={openCluster}
          renderCluster={renderCluster}
        />
      ))}
      {visible.singles.map(({ index, item }) => (
        <Fragment key={`item:${index}`}>{renderMarker(item, index)}</Fragment>
      ))}
    </>
  );
}
