import type { Bound, Location } from "@/types";

/** A group of nearby points shown as one marker. */
export interface Cluster<T> {
  /** Bounding box of the points. */
  bound: Bound;
  count: number;
  items: T[];
  /** Stable while the cluster has the same first point and size. */
  key: string;
  /** Average position of the points. */
  position: Location;
}

export interface ClusterOptions {
  /** Points never cluster above this zoom. Default `16`. */
  maxZoom?: number;
  /** Fewest points that form a cluster. Default `2`. */
  minPoints?: number;
  /** How close points must be, in screen pixels. Default `60`. */
  radius?: number;
  /** Zoom level to cluster at. */
  zoom: number;
}

export interface ClusterResult<T> {
  clusters: Cluster<T>[];
  /** Points shown on their own, with their index in the input. */
  singles: { index: number; item: T }[];
}

/** World size in pixels at zoom 0 (MapLibre uses 512 px tiles). */
const TILE_SIZE = 512;
/** Web Mercator's latitude limit. */
const MAX_LATITUDE = 85.051_128_78;

interface ProjectedPoint<T> {
  index: number;
  item: T;
  position: Location;
  x: number;
  y: number;
}

/** Web Mercator pixel coordinates of a location in a world `scale` px wide. */
function project(location: Location, scale: number): [number, number] {
  const lat = Math.max(-MAX_LATITUDE, Math.min(MAX_LATITUDE, location.lat));
  const sin = Math.sin((lat * Math.PI) / 180);
  return [
    ((location.lon + 180) / 360) * scale,
    (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  ];
}

/** Combines member points into a cluster. */
function toCluster<T>(members: ProjectedPoint<T>[]): Cluster<T> {
  const bound: Bound = {
    maxLat: Number.NEGATIVE_INFINITY,
    maxLon: Number.NEGATIVE_INFINITY,
    minLat: Number.POSITIVE_INFINITY,
    minLon: Number.POSITIVE_INFINITY,
  };
  let lonSum = 0;
  let latSum = 0;
  let firstIndex = Number.POSITIVE_INFINITY;
  for (const { index, position } of members) {
    bound.minLon = Math.min(bound.minLon, position.lon);
    bound.maxLon = Math.max(bound.maxLon, position.lon);
    bound.minLat = Math.min(bound.minLat, position.lat);
    bound.maxLat = Math.max(bound.maxLat, position.lat);
    lonSum += position.lon;
    latSum += position.lat;
    firstIndex = Math.min(firstIndex, index);
  }
  return {
    bound,
    count: members.length,
    items: members.map((member) => member.item),
    key: `${firstIndex}:${members.length}`,
    position: { lat: latSum / members.length, lon: lonSum / members.length },
  };
}

/** Grows a bounding box by `ratio` of its width and height on every side. */
export function expandBound(bound: Bound, ratio: number): Bound {
  const width = bound.maxLon - bound.minLon;
  const height = bound.maxLat - bound.minLat;
  return {
    maxLat: bound.maxLat + height * ratio,
    maxLon: bound.maxLon + width * ratio,
    minLat: bound.minLat - height * ratio,
    minLon: bound.minLon - width * ratio,
  };
}

/** Whether a location lies inside a bounding box, edges included. */
export function isInBound(location: Location, bound: Bound): boolean {
  return (
    location.lon >= bound.minLon &&
    location.lon <= bound.maxLon &&
    location.lat >= bound.minLat &&
    location.lat <= bound.maxLat
  );
}

/**
 * Groups points that are within `radius` pixels of each other at `zoom`.
 * Each point joins at most one cluster, and a grid of radius-sized cells
 * keeps the neighbor search fast for thousands of points.
 */
export function clusterPoints<T>(
  items: readonly T[],
  getPosition: (item: T) => Location,
  options: ClusterOptions
): ClusterResult<T> {
  const { maxZoom = 16, minPoints = 2, radius = 60, zoom } = options;
  if (zoom > maxZoom) {
    return {
      clusters: [],
      singles: items.map((item, index) => ({ index, item })),
    };
  }

  const scale = TILE_SIZE * 2 ** zoom;
  const points: ProjectedPoint<T>[] = items.map((item, index) => {
    const position = getPosition(item);
    const [x, y] = project(position, scale);
    return { index, item, position, x, y };
  });
  const cellOf = (value: number) => Math.floor(value / radius);
  const cells = new Map<string, ProjectedPoint<T>[]>();
  for (const point of points) {
    const key = `${cellOf(point.x)}:${cellOf(point.y)}`;
    const cell = cells.get(key);
    if (cell) {
      cell.push(point);
    } else {
      cells.set(key, [point]);
    }
  }

  const assigned = new Set<ProjectedPoint<T>>();
  const result: ClusterResult<T> = { clusters: [], singles: [] };
  for (const seed of points) {
    if (assigned.has(seed)) {
      continue;
    }
    const members: ProjectedPoint<T>[] = [];
    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dy = -1; dy <= 1; dy += 1) {
        const key = `${cellOf(seed.x) + dx}:${cellOf(seed.y) + dy}`;
        for (const candidate of cells.get(key) ?? []) {
          const isNear =
            Math.hypot(candidate.x - seed.x, candidate.y - seed.y) <= radius;
          if (isNear && !assigned.has(candidate)) {
            members.push(candidate);
          }
        }
      }
    }
    if (members.length >= minPoints) {
      for (const member of members) {
        assigned.add(member);
      }
      result.clusters.push(toCluster(members));
    } else {
      assigned.add(seed);
      result.singles.push({ index: seed.index, item: seed.item });
    }
  }
  return result;
}
