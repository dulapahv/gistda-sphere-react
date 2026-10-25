import { describe, expect, expectTypeOf, it } from "vitest";
import {
  createSphereServices,
  getTurnInstruction,
  MarkerCluster,
  type PredefinedOverlay,
  PredefinedOverlay as PredefinedOverlayComponent,
  ROUTE_TURN,
  SphereMap,
  type SphereMapInstance,
  SphereServiceError,
  useMapReady,
  useMapView,
  useSphereServices,
  useSuggest,
  useUi,
} from "@/index";

describe("package exports", () => {
  it("exports the PredefinedOverlay type alongside the component", () => {
    expectTypeOf<PredefinedOverlay>().toEqualTypeOf<
      "cameras" | "events" | "aqi"
    >();
    expect(typeof PredefinedOverlayComponent).toBe("function");
  });

  it("keeps the map instance type available as SphereMapInstance", () => {
    expectTypeOf<SphereMapInstance>().toHaveProperty("Route");
    expect(typeof SphereMap).toBe("function");
  });

  it("exports the new hooks, services and helpers", () => {
    for (const value of [
      createSphereServices,
      getTurnInstruction,
      MarkerCluster,
      useMapReady,
      useMapView,
      useSphereServices,
      useSuggest,
      useUi,
    ]) {
      expect(typeof value).toBe("function");
    }
    expect(
      new SphereServiceError("x", { code: "key", service: "s" })
    ).toBeInstanceOf(Error);
    expect(ROUTE_TURN.Arrive).toBe(9);
  });
});
