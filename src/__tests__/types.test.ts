import { describe, expect, expectTypeOf, it } from "vitest";
import type {
  Bound,
  Language,
  Location,
  Range,
  SphereMap,
  SphereMarker,
  SpherePolygon,
  SphereRoute,
} from "@/types";

/**
 * Compile-time checks (run by `pnpm typecheck`): Sphere's getters return
 * plain values, so `map.zoom()` can be used as a number without casting.
 */
function getterTypes(
  map: SphereMap,
  marker: SphereMarker,
  polygon: SpherePolygon,
  route: SphereRoute
) {
  expectTypeOf(map.zoom()).toEqualTypeOf<number>();
  expectTypeOf(map.zoom(12)).toEqualTypeOf<SphereMap>();
  expectTypeOf(map.location()).toEqualTypeOf<Location>();
  expectTypeOf(map.bound()).toEqualTypeOf<Bound>();
  expectTypeOf(map.rotate()).toEqualTypeOf<number>();
  expectTypeOf(map.pitch()).toEqualTypeOf<number>();
  expectTypeOf(map.language()).toEqualTypeOf<Language>();
  expectTypeOf(map.zoomRange()).toEqualTypeOf<Range>();
  expectTypeOf(marker.location()).toEqualTypeOf<Location>();
  expectTypeOf(polygon.size()).toEqualTypeOf<number>();
  expectTypeOf(polygon.size("en")).toEqualTypeOf<string>();
  expectTypeOf(route.distance()).toEqualTypeOf<number>();
  expectTypeOf(route.distance(true)).toEqualTypeOf<string>();
  expectTypeOf(route.auto()).toEqualTypeOf<boolean>();
  expectTypeOf(route.auto(true)).toEqualTypeOf<SphereRoute>();
  expectTypeOf(window.deck).not.toBeNever();
}

describe("Sphere types", () => {
  it("type getters as plain values (checked at compile time)", () => {
    expect(getterTypes).toBeTypeOf("function");
  });
});
