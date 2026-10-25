import { describe, expect, it, vi } from "vitest";
import {
  fromFilterValue,
  fromRouteLabelValue,
  fromRouteModeValue,
  toFilterValue,
  toLineStyleValue,
  toRouteLabelValue,
  toRouteLineValue,
  toRouteModeValue,
  toRouteRestrictValue,
  toRouteTypeValue,
  toUiComponentValue,
} from "@/internal/enums";
import {
  computeBound,
  toFeatures,
  toRenderableGeometries,
} from "@/internal/geojson";
import {
  createSpatialMethods,
  isLocation,
  toSpatialOverlay,
  toSphereGeometryOptions,
  withoutUndefined,
} from "@/internal/geometry";
import { countLocations } from "@/internal/geometryRef";
import { isDeepEqual } from "@/internal/hooks";
import { addMapLayer } from "@/internal/mapControls";
import type { SphereNamespace, SphereOverlay } from "@/types";
import { getTurnInstruction, ROUTE_TURN } from "@/utils/routeGuide";
import { createMockSphereApi } from "./setup";

const sphere = createMockSphereApi().mockSphere as unknown as SphereNamespace;

describe("enum converters", () => {
  it("maps line styles to runtime dash arrays", () => {
    expect(toLineStyleValue(sphere, "Dashed")).toEqual([6, 4]);
    expect(toLineStyleValue(sphere, "Dot")).toEqual([2, 2]);
    expect(toLineStyleValue(sphere, "Solid")).toEqual([0]);
    expect(toLineStyleValue(sphere, [10, 5])).toEqual([10, 5]);
    expect(toLineStyleValue(sphere, undefined)).toBeUndefined();
  });

  it("maps filters both ways", () => {
    expect(toFilterValue(sphere, "Dark")).toBe("DARK");
    expect(toFilterValue(sphere, "None")).toBe(false);
    expect(toFilterValue(sphere, false)).toBe(false);
    expect(fromFilterValue(sphere, "PROTANOPIA")).toBe("Protanopia");
    expect(fromFilterValue(sphere, false)).toBe("None");
    expect(fromFilterValue(sphere, "OTHER")).toBeUndefined();
  });

  it("maps UI modes, with None as false", () => {
    expect(toUiComponentValue(sphere, "Full")).toBe("FULL");
    expect(toUiComponentValue(sphere, "Mobile")).toBe("MOBILE");
    expect(toUiComponentValue(sphere, "None")).toBe(false);
  });

  it("maps route enums", () => {
    expect(toRouteModeValue(sphere, "Traffic")).toBe("t");
    expect(toRouteModeValue(sphere, undefined)).toBeUndefined();
    expect(fromRouteModeValue(sphere, "f")).toBe("Fly");
    expect(toRouteTypeValue(sphere, "All")).toBe(127);
    expect(toRouteLabelValue(sphere, "Hide")).toBe(false);
    expect(toRouteLabelValue(sphere, "Distance")).toBe("d");
    expect(fromRouteLabelValue(sphere, "t")).toBe("Time");
    expect(toRouteLineValue(sphere, "Ferry")).toBe("ferry");
    expect(toRouteRestrictValue(sphere, "Bike")).toBe(1);
  });
});

describe("geometry helpers", () => {
  it("recognizes locations", () => {
    expect(isLocation({ lat: 13, lon: 100 })).toBe(true);
    expect(isLocation({ lat: Number.NaN, lon: 100 })).toBe(false);
    expect(isLocation({ coordinates: [100, 13], type: "Point" })).toBe(false);
    expect(isLocation(null)).toBe(false);
  });

  it("drops undefined values", () => {
    expect(withoutUndefined({ a: 1, b: undefined, c: false })).toEqual({
      a: 1,
      c: false,
    });
  });

  it("builds Sphere geometry options", () => {
    expect(
      toSphereGeometryOptions(sphere, {
        lineColor: "red",
        lineStyle: "Dashed",
        title: undefined,
      })
    ).toEqual({ lineColor: "red", lineStyle: [6, 4] });
  });

  it("wraps plain locations in a Dot for spatial predicates", () => {
    const overlay = {} as SphereOverlay;
    expect(toSpatialOverlay(sphere, overlay)).toBe(overlay);
    toSpatialOverlay(sphere, { lat: 13, lon: 100 });
    expect(sphere.Dot).toHaveBeenCalledWith({ lat: 13, lon: 100 });
  });

  it("creates spatial methods that accept locations", () => {
    const target = {
      contains: vi.fn().mockReturnValue(true),
      distance: vi.fn().mockReturnValue(42),
      intersects: vi.fn().mockReturnValue(true),
      shift: vi.fn(),
      toJSON: vi.fn().mockReturnValue({ type: "Feature" }),
      within: vi.fn().mockReturnValue(true),
    } as unknown as SphereOverlay;
    const methods = createSpatialMethods(
      () => sphere,
      () => target
    );

    expect(methods.contains({ lat: 13, lon: 100 })).toBe(true);
    expect(methods.intersects({ lat: 13, lon: 100 })).toBe(true);
    expect(methods.distanceTo({ lat: 13, lon: 100 }, "en")).toBe(42);
    expect(methods.within(target)).toBe(true);
    expect(methods.toGeoJSON()).toEqual({ type: "Feature" });
    methods.shift({ lat: 0, lon: 1 });
    expect(target.shift).toHaveBeenCalledWith({ lat: 0, lon: 1 });

    const empty = createSpatialMethods(
      () => sphere,
      () => null
    );
    expect(empty.contains({ lat: 13, lon: 100 })).toBe(false);
    expect(empty.distanceTo({ lat: 13, lon: 100 })).toBeNull();
    expect(empty.toGeoJSON()).toBeNull();
  });

  it("counts locations, skipping ring separators", () => {
    expect(countLocations([{ lat: 1, lon: 1 }, null, { lat: 2, lon: 2 }])).toBe(
      2
    );
    expect(countLocations({ coordinates: [], type: "LineString" })).toBe(
      Number.POSITIVE_INFINITY
    );
  });
});

describe("isDeepEqual", () => {
  it("compares plain data structurally", () => {
    expect(isDeepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true);
    expect(isDeepEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(isDeepEqual([1, 2], { 0: 1, 1: 2 })).toBe(false);
    expect(isDeepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(isDeepEqual(Number.NaN, Number.NaN)).toBe(true);
  });

  it("compares functions and instances by reference", () => {
    const fn = () => 1;
    expect(isDeepEqual({ fn }, { fn })).toBe(true);
    expect(isDeepEqual({ fn }, { fn: () => 1 })).toBe(false);
    expect(isDeepEqual(new Date(0), new Date(0))).toBe(false);
  });
});

describe("GeoJSON helpers", () => {
  const point = { coordinates: [100, 13], type: "Point" as const };

  it("normalizes input into features", () => {
    expect(toFeatures(point)).toEqual([
      { geometry: point, properties: {}, type: "Feature" },
    ]);
    const feature = {
      geometry: point,
      properties: null,
      type: "Feature" as const,
    };
    expect(toFeatures(feature)).toEqual([feature]);
    expect(
      toFeatures({ features: [feature], type: "FeatureCollection" })
    ).toEqual([feature]);
  });

  it("splits collections and multi-points into renderable parts", () => {
    expect(toRenderableGeometries(null)).toEqual([]);
    expect(
      toRenderableGeometries({
        coordinates: [
          [100, 13],
          [101, 14],
        ],
        type: "MultiPoint",
      })
    ).toHaveLength(2);
    expect(
      toRenderableGeometries({
        geometries: [point, { coordinates: [[100, 13]], type: "LineString" }],
        type: "GeometryCollection",
      })
    ).toHaveLength(2);
  });

  it("computes bounds of any geometry", () => {
    expect(
      computeBound({
        coordinates: [
          [
            [
              [100, 13],
              [102, 15],
              [101, 12],
            ],
          ],
        ],
        type: "MultiPolygon",
      })
    ).toEqual({ maxLat: 15, maxLon: 102, minLat: 12, minLon: 100 });
    expect(
      computeBound({ features: [], type: "FeatureCollection" })
    ).toBeNull();
  });
});

describe("route guide utilities", () => {
  it("builds localized turn instructions", () => {
    expect(getTurnInstruction(ROUTE_TURN.TurnRight, "Rama IV Rd")).toBe(
      "Turn right to Rama IV Rd"
    );
    expect(getTurnInstruction(ROUTE_TURN.TurnLeft, "ถนนพระราม 4", "th")).toBe(
      "เลี้ยวซ้ายสู่ ถนนพระราม 4"
    );
    expect(getTurnInstruction(ROUTE_TURN.Arrive, "")).toBe(
      "Arrive at the destination"
    );
  });

  it("words steps without a road, including Sphere's Fly placeholder", () => {
    expect(getTurnInstruction(ROUTE_TURN.HeadToward, "?")).toBe(
      "Head to the next stop"
    );
    expect(getTurnInstruction(ROUTE_TURN.UTurn, " ", "th")).toBe("กลับรถ");
  });

  it("shows ferry names on their own and unknown codes as the name", () => {
    expect(getTurnInstruction(ROUTE_TURN.Ferry, "Ferry to Ko Samui")).toBe(
      "Ferry to Ko Samui"
    );
    expect(getTurnInstruction(ROUTE_TURN.Ferry, "")).toBe("Take the ferry");
    expect(getTurnInstruction(42, "Somewhere")).toBe("Somewhere");
  });

  it("tolerates a missing road name and an unknown language", () => {
    expect(getTurnInstruction(ROUTE_TURN.TurnLeft, undefined)).toBe(
      "Turn left"
    );
    expect(getTurnInstruction(ROUTE_TURN.TurnLeft, null, "th")).toBe("เลี้ยวซ้าย");
    expect(
      getTurnInstruction(ROUTE_TURN.TurnRight, "Rama IV Rd", "fr" as never)
    ).toBe("Turn right to Rama IV Rd");
  });
});

describe("addMapLayer", () => {
  /** A map whose `Layers.add` does not add right away, like Sphere loading a style. */
  function createLoadingMap() {
    const handlers = new Set<(...args: unknown[]) => void>();
    return {
      Event: {
        bind: vi.fn((_: string, handler: (...args: unknown[]) => void) => {
          handlers.add(handler);
        }),
        /** Announces a layer the way Sphere does once it is on the map. */
        fire: (...args: unknown[]) => {
          for (const handler of handlers) {
            handler(...args);
          }
        },
        unbind: vi.fn((_: string, handler: (...args: unknown[]) => void) => {
          handlers.delete(handler);
        }),
      },
      Layers: { add: vi.fn(), remove: vi.fn() },
    };
  }

  it("removes a still-loading layer once Sphere adds it", async () => {
    const map = createLoadingMap();
    const layer = { style: "https://example.com/style.json" };

    const remove = addMapLayer(map as never, layer, "labels");
    expect(map.Layers.add).toHaveBeenCalledWith(layer, "labels");

    remove();
    expect(map.Layers.remove).not.toHaveBeenCalled();

    map.Event.fire({ style: {} });
    map.Event.fire(layer);
    await Promise.resolve();
    expect(map.Layers.remove).toHaveBeenCalledWith(layer);

    remove();
    expect(map.Layers.remove).toHaveBeenCalledTimes(1);
  });

  it("pairs each add with one completion, as when React mounts twice", async () => {
    const map = createLoadingMap();
    const layer = { style: "https://example.com/flood.json" };

    // Each add of a loading layer fetches its style and adds it again later.
    const removeFirst = addMapLayer(map as never, layer);
    removeFirst();
    const removeSecond = addMapLayer(map as never, layer);

    map.Event.fire(layer);
    await Promise.resolve();
    expect(map.Layers.remove).toHaveBeenCalledTimes(1);

    map.Event.fire(layer);
    await Promise.resolve();
    expect(map.Layers.remove).toHaveBeenCalledTimes(1);

    removeSecond();
    expect(map.Layers.remove).toHaveBeenCalledTimes(2);
  });

  it("recognizes 3D tiles, which Sphere adds as a layer with the same id", async () => {
    const map = createLoadingMap();
    const tiles = { id: "buildings", style: () => Promise.resolve({}) };

    const remove = addMapLayer(map as never, tiles);
    map.Event.fire({ id: "buildings" });
    await Promise.resolve();
    expect(map.Layers.remove).not.toHaveBeenCalled();

    remove();
    expect(map.Layers.remove).toHaveBeenCalledWith(tiles);
  });
});
