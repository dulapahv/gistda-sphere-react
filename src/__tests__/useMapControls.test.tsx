import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SphereProvider, useMapControls } from "../context/SphereContext";
import { createMockSphereApi } from "./setup";

describe("useMapControls", () => {
  const { mockSphere } = createMockSphereApi();

  beforeEach(() => {
    // @ts-expect-error - mockSphere is a partial mock of SphereNamespace
    window.sphere = mockSphere;
    vi.clearAllMocks();
  });

  function createWrapper() {
    return function Wrapper({ children }: { children: ReactNode }) {
      return <SphereProvider apiKey="test-key">{children}</SphereProvider>;
    };
  }

  describe("when map is not registered", () => {
    it("reports isReady as false", () => {
      const { result } = renderHook(() => useMapControls(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isReady).toBe(false);
    });

    it("goTo is a no-op when map is not ready", () => {
      const { result } = renderHook(() => useMapControls(), {
        wrapper: createWrapper(),
      });

      // Should not throw
      result.current.goTo({ center: { lon: 100, lat: 13 }, zoom: 12 });
    });

    it("setCenter is a no-op when map is not ready", () => {
      const { result } = renderHook(() => useMapControls(), {
        wrapper: createWrapper(),
      });

      result.current.setCenter({ lon: 100, lat: 13 });
    });

    it("setZoom is a no-op when map is not ready", () => {
      const { result } = renderHook(() => useMapControls(), {
        wrapper: createWrapper(),
      });

      result.current.setZoom(15);
    });

    it("setBound is a no-op when map is not ready", () => {
      const { result } = renderHook(() => useMapControls(), {
        wrapper: createWrapper(),
      });

      result.current.setBound({
        minLon: 100,
        minLat: 13,
        maxLon: 101,
        maxLat: 14,
      });
    });

    it("setRotate is a no-op when map is not ready", () => {
      const { result } = renderHook(() => useMapControls(), {
        wrapper: createWrapper(),
      });

      result.current.setRotate(45);
    });

    it("setPitch is a no-op when map is not ready", () => {
      const { result } = renderHook(() => useMapControls(), {
        wrapper: createWrapper(),
      });

      result.current.setPitch(30);
    });

    it("setFilter is a no-op when map is not ready", () => {
      const { result } = renderHook(() => useMapControls(), {
        wrapper: createWrapper(),
      });

      result.current.setFilter("Dark");
    });

    it("setLanguage is a no-op when map is not ready", () => {
      const { result } = renderHook(() => useMapControls(), {
        wrapper: createWrapper(),
      });

      result.current.setLanguage("en");
    });

    it("setBaseLayer is a no-op when map is not ready", () => {
      const { result } = renderHook(() => useMapControls(), {
        wrapper: createWrapper(),
      });

      result.current.setBaseLayer("HYBRID");
    });

    it("addLayer is a no-op when map is not ready", () => {
      const { result } = renderHook(() => useMapControls(), {
        wrapper: createWrapper(),
      });

      result.current.addLayer("TRAFFIC");
    });

    it("removeLayer is a no-op when map is not ready", () => {
      const { result } = renderHook(() => useMapControls(), {
        wrapper: createWrapper(),
      });

      result.current.removeLayer("TRAFFIC");
    });

    it("resize is a no-op when map is not ready", () => {
      const { result } = renderHook(() => useMapControls(), {
        wrapper: createWrapper(),
      });

      result.current.resize();
    });

    it("repaint is a no-op when map is not ready", () => {
      const { result } = renderHook(() => useMapControls(), {
        wrapper: createWrapper(),
      });

      result.current.repaint();
    });
  });

  describe("control methods return correct interface", () => {
    it("exposes all 14 control methods", async () => {
      const { result } = renderHook(() => useMapControls(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      expect(typeof result.current.isReady).toBe("boolean");
      expect(typeof result.current.goTo).toBe("function");
      expect(typeof result.current.setCenter).toBe("function");
      expect(typeof result.current.setZoom).toBe("function");
      expect(typeof result.current.setBound).toBe("function");
      expect(typeof result.current.setRotate).toBe("function");
      expect(typeof result.current.setPitch).toBe("function");
      expect(typeof result.current.setFilter).toBe("function");
      expect(typeof result.current.setLanguage).toBe("function");
      expect(typeof result.current.setBaseLayer).toBe("function");
      expect(typeof result.current.addLayer).toBe("function");
      expect(typeof result.current.removeLayer).toBe("function");
      expect(typeof result.current.resize).toBe("function");
      expect(typeof result.current.repaint).toBe("function");
    });
  });
});
