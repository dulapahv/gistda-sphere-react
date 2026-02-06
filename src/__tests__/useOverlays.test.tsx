import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  useCircles,
  useMarkers,
  useOverlays,
  usePolygons,
  usePolylines,
} from "../hooks/useOverlays";

describe("useOverlays hooks", () => {
  describe("useMarkers", () => {
    it("starts with empty items", () => {
      const { result } = renderHook(() => useMarkers());
      expect(result.current.items).toEqual([]);
    });

    it("adds a marker and returns its id", () => {
      const { result } = renderHook(() => useMarkers());

      let id = "";
      act(() => {
        id = result.current.add({
          position: { lon: 100.5, lat: 13.75 },
          title: "Test Marker",
        });
      });

      expect(result.current.items).toHaveLength(1);

      const marker = result.current.items[0];
      expect(marker).toBeDefined();
      expect(marker?.id).toBe(id);
      expect(marker?.position).toEqual({
        lon: 100.5,
        lat: 13.75,
      });
      expect(marker?.title).toBe("Test Marker");
    });

    it("allows custom id", () => {
      const { result } = renderHook(() => useMarkers());

      act(() => {
        result.current.add({
          id: "custom-id",
          position: { lon: 100.5, lat: 13.75 },
        });
      });

      const marker = result.current.items[0];
      expect(marker).toBeDefined();
      expect(marker?.id).toBe("custom-id");
    });

    it("updates a marker", () => {
      const { result } = renderHook(() => useMarkers());

      let id = "";
      act(() => {
        id = result.current.add({
          position: { lon: 100.5, lat: 13.75 },
          title: "Original",
        });
      });

      act(() => {
        result.current.update(id, { title: "Updated" });
      });

      const marker = result.current.items[0];
      expect(marker).toBeDefined();
      expect(marker?.title).toBe("Updated");
      expect(marker?.position).toEqual({
        lon: 100.5,
        lat: 13.75,
      });
    });

    it("removes a marker", () => {
      const { result } = renderHook(() => useMarkers());

      let id = "";
      act(() => {
        id = result.current.add({
          position: { lon: 100.5, lat: 13.75 },
        });
      });

      expect(result.current.items).toHaveLength(1);

      act(() => {
        result.current.remove(id);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it("clears all markers", () => {
      const { result } = renderHook(() => useMarkers());

      act(() => {
        result.current.add({ position: { lon: 100.5, lat: 13.75 } });
        result.current.add({ position: { lon: 101.5, lat: 14.75 } });
        result.current.add({ position: { lon: 102.5, lat: 15.75 } });
      });

      expect(result.current.items).toHaveLength(3);

      act(() => {
        result.current.clear();
      });

      expect(result.current.items).toHaveLength(0);
    });

    it("gets a marker by id", () => {
      const { result } = renderHook(() => useMarkers());

      let id = "";
      act(() => {
        id = result.current.add({
          position: { lon: 100.5, lat: 13.75 },
          title: "Find Me",
        });
      });

      const found = result.current.get(id);
      expect(found?.title).toBe("Find Me");

      const notFound = result.current.get("non-existent");
      expect(notFound).toBeUndefined();
    });
  });

  describe("usePolygons", () => {
    it("adds and removes polygons", () => {
      const { result } = renderHook(() => usePolygons());

      let id = "";
      act(() => {
        id = result.current.add({
          positions: [
            { lon: 100.4, lat: 13.8 },
            { lon: 100.6, lat: 13.8 },
            { lon: 100.5, lat: 13.6 },
          ],
          fillColor: "rgba(255, 0, 0, 0.3)",
        });
      });

      expect(result.current.items).toHaveLength(1);

      const polygon = result.current.items[0];
      expect(polygon).toBeDefined();
      expect(polygon?.positions).toHaveLength(3);

      act(() => {
        result.current.remove(id);
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe("usePolylines", () => {
    it("adds and updates polylines", () => {
      const { result } = renderHook(() => usePolylines());

      let id = "";
      act(() => {
        id = result.current.add({
          positions: [
            { lon: 100.4, lat: 13.8 },
            { lon: 100.6, lat: 13.6 },
          ],
          lineWidth: 2,
        });
      });

      act(() => {
        result.current.update(id, { lineWidth: 5 });
      });

      const polyline = result.current.items[0];
      expect(polyline).toBeDefined();
      expect(polyline?.lineWidth).toBe(5);
    });
  });

  describe("useCircles", () => {
    it("adds circles with center and radius", () => {
      const { result } = renderHook(() => useCircles());

      act(() => {
        result.current.add({
          center: { lon: 100.5, lat: 13.75 },
          radius: 0.01,
          fillColor: "rgba(0, 0, 255, 0.3)",
        });
      });

      expect(result.current.items).toHaveLength(1);

      const circle = result.current.items[0];
      expect(circle).toBeDefined();
      expect(circle?.center).toEqual({
        lon: 100.5,
        lat: 13.75,
      });
      expect(circle?.radius).toBe(0.01);
    });
  });

  describe("useOverlays", () => {
    it("provides all overlay types", () => {
      const { result } = renderHook(() => useOverlays());

      expect(result.current.markers).toBeDefined();
      expect(result.current.polygons).toBeDefined();
      expect(result.current.polylines).toBeDefined();
      expect(result.current.circles).toBeDefined();
      expect(result.current.clearAll).toBeDefined();
    });

    it("clearAll removes all overlays", () => {
      const { result } = renderHook(() => useOverlays());

      act(() => {
        result.current.markers.add({ position: { lon: 100, lat: 13 } });
        result.current.polygons.add({
          positions: [
            { lon: 100, lat: 13 },
            { lon: 101, lat: 14 },
            { lon: 100, lat: 14 },
          ],
        });
        result.current.polylines.add({
          positions: [
            { lon: 100, lat: 13 },
            { lon: 101, lat: 14 },
          ],
        });
        result.current.circles.add({
          center: { lon: 100, lat: 13 },
          radius: 0.01,
        });
      });

      expect(result.current.markers.items).toHaveLength(1);
      expect(result.current.polygons.items).toHaveLength(1);
      expect(result.current.polylines.items).toHaveLength(1);
      expect(result.current.circles.items).toHaveLength(1);

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.markers.items).toHaveLength(0);
      expect(result.current.polygons.items).toHaveLength(0);
      expect(result.current.polylines.items).toHaveLength(0);
      expect(result.current.circles.items).toHaveLength(0);
    });
  });
});
